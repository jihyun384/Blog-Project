const pool = require("../config/db");

exports.createPost = async (user_id, { title, subtitle, content, cover, categories }) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const blogRes = await client.query(
            `SELECT blog_id 
            FROM "Blog" 
            WHERE user_id = $1`,
            [user_id]
        );
        if (blogRes.rows.length === 0) throw new Error("블로그가 존재하지 않습니다");
        const blog_id = blogRes.rows[0].blog_id;

        const postRes = await client.query(
            `INSERT INTO "Post" (blog_id, title, subtitle, content, cover) 
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [blog_id, title, subtitle || null, content, cover || null]
        );
        const post = postRes.rows[0];

        if (categories && categories.length > 0) {
            for (const catName of categories) {
                let catRes = await client.query(
                    `SELECT category_id 
                    FROM "Category" 
                    WHERE name = lower($1)`,
                    [catName]
                );
                let category_id;

                if (catRes.rows.length === 0) {
                    const insertCat = await client.query(
                        `INSERT INTO "Category" (name) 
                        VALUES (lower($1)) 
                        RETURNING category_id`,
                        [catName]
                    );
                    category_id = insertCat.rows[0].category_id;
                } else {
                    category_id = catRes.rows[0].category_id;
                }

                await client.query(
                    `INSERT INTO "PostCategory" (post_id, category_id)
                    VALUES ($1, $2)
                    ON CONFLICT DO NOTHING`,
                    [post.post_id, category_id]
                );
            }
        }

        await client.query("COMMIT");
        return post;
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

exports.getPostById = async (post_id, user_id = null) => {
    const client = await pool.connect();
    try {
        const postRes = await client.query(
            `SELECT 
                p.post_id, p.title, p.subtitle, p.content, p.cover, p.created_at,
                b.blog_id, u.user_id, u.user_name
            FROM "Post" p
            JOIN "Blog" b ON p.blog_id = b.blog_id
            JOIN "User" u ON b.user_id = u.user_id
            WHERE p.post_id = $1`,
            [post_id]
        );

        if (postRes.rows.length === 0) return null;
        const post = postRes.rows[0];

        const categoryRes = await client.query(
            `SELECT c.name
            FROM "PostCategory" pc
            JOIN "Category" c ON pc.category_id = c.category_id
            WHERE pc.post_id = $1`,
            [post_id]
        );
        post.categories = categoryRes.rows.map((row) => row.name);

        const likeCountRes = await client.query(
            `SELECT COUNT(*) 
            FROM "Like" 
            WHERE post_id = $1`,
            [post_id]
        );
        post.like_count = parseInt(likeCountRes.rows[0].count);

        if (user_id) {
            const likedRes = await client.query(
                `SELECT 1 
                FROM "Like"
                WHERE post_id = $1 AND user_id = $2`,
                [post_id, user_id]
            );
            post.liked = likedRes.rows.length > 0;
        } else {
            post.liked = false;
        }

        return post;
    } finally {
        client.release();
    }
};

exports.toggleLike = async (post_id, user_id) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const likeRes = await client.query(
            `SELECT * 
            FROM "Like"
            WHERE post_id = $1 AND user_id = $2`,
            [post_id, user_id]
        );

        let liked;
        if (likeRes.rows.length > 0) {
            await client.query(
                `DELETE FROM "Like" 
                WHERE post_id = $1 AND user_id = $2`,
                [post_id, user_id]
            );
            liked = false;
        } else {
            await client.query(
                `INSERT INTO "Like" (post_id, user_id) 
                VALUES ($1, $2)`,
                [post_id, user_id]
            );
            liked = true;
        }

        const countRes = await client.query(
            `SELECT COUNT(*) 
            FROM "Like" 
            WHERE post_id = $1`,
            [post_id]
        );
        const like_count = parseInt(countRes.rows[0].count);

        await client.query("COMMIT");
        return { liked, like_count };
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

exports.deletePost = async (post_id, user_id) => {
    const postRes = await pool.query(
        `SELECT b.user_id AS author_id
        FROM "Post" p
        JOIN "Blog" b ON p.blog_id = b.blog_id
        WHERE p.post_id = $1`,
        [post_id]
    );

    if (!postRes.rows[0] || postRes.rows[0].author_id !== user_id) {
        throw new Error("권한이 없습니다");
    }

    await pool.query(`DELETE FROM "Post" WHERE post_id = $1`, [post_id]);
    return true;
};

exports.updatePost = async (post_id, user_id, { title, subtitle, content, coverPath, categories }) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const postRes = await client.query(
            `SELECT b.user_id AS author_id
            FROM "Post" p
            JOIN "Blog" b ON p.blog_id = b.blog_id
            WHERE p.post_id = $1`,
            [post_id]
        );

        if (postRes.rows.length === 0) throw new Error("포스트가 존재하지 않습니다");
        if (postRes.rows[0].author_id !== user_id) throw new Error("권한이 없습니다");

        const updateQuery = `
            UPDATE "Post"
            SET 
                title = $1,
                subtitle = $2,
                content = $3,
                cover = COALESCE($4, cover)
            WHERE post_id = $5
            RETURNING *;`;
        const updateValues = [title, subtitle || null, content, coverPath || null, post_id];
        const updatedPostRes = await client.query(updateQuery, updateValues);
        const updatedPost = updatedPostRes.rows[0];

        if (categories) {
            const categoryArr = typeof categories === "string" ? JSON.parse(categories) : categories;

            await client.query(
                `DELETE FROM "PostCategory"
                WHERE post_id = $1`,
                [post_id]
            );

            for (const catName of categoryArr) {
                let catRes = await client.query(
                    `SELECT category_id 
                    FROM "Category" 
                    WHERE name = $1`,
                    [catName]
                );
                let category_id;
                if (catRes.rows.length === 0) {
                    const insertCat = await client.query(
                        `INSERT INTO "Category"(name) 
                        VALUES($1) 
                        RETURNING category_id`,
                        [catName]
                    );
                    category_id = insertCat.rows[0].category_id;
                } else {
                    category_id = catRes.rows[0].category_id;
                }

                await client.query(
                    `INSERT INTO "PostCategory"(post_id, category_id)
                    VALUES($1, $2)
                    ON CONFLICT DO NOTHING`,
                    [post_id, category_id]
                );
            }
        }

        await client.query("COMMIT");
        return updatedPost;
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};
