const pool = require("../config/db");

function buildComment(comments) {
    const map = {};
    const roots = [];

    comments.forEach((c) => {
        c.children = [];
        map[c.comment_id] = c;
    });

    comments.forEach((c) => {
        if (c.parent_id) {
            if (map[c.parent_id]) map[c.parent_id].children.push(c);
        } else {
            roots.push(c);
        }
    });

    return roots;
}

async function getPostAuthor(post_id) {
    const query = `
        SELECT b.user_id AS post_author
        FROM "Post" p
        JOIN "Blog" b ON p.blog_id = b.blog_id
        WHERE p.post_id = $1`;
    const { rows } = await pool.query(query, [post_id]);
    return rows[0]?.post_author || null;
}

async function getCommentsByPostId(post_id) {
    const query = `
        SELECT
            c.comment_id,
            c.parent_id,
            c.user_id,
            u.user_name,
            c.content,
            c.created_at
        FROM "Comment" c
        JOIN "User" u ON c.user_id = u.user_id
        WHERE c.post_id = $1
        ORDER BY c.created_at ASC`;
    const { rows } = await pool.query(query, [post_id]);
    return buildComment(rows);
}

async function createComment(post_id, user_id, content, parent_id = null) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const insertQuery = `
            INSERT INTO "Comment" (post_id, user_id, parent_id, content)
            VALUES ($1, $2, $3, $4)
            RETURNING *`;
        const { rows } = await client.query(insertQuery, [post_id, user_id, parent_id, content]);

        await client.query(
            `UPDATE "Post" 
            SET comment_count = COALESCE(comment_count, 0) + 1 
            WHERE post_id = $1`,
            [post_id]
        );

        await client.query("COMMIT");
        return rows[0];
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
}

async function getCommentAuthor(comment_id) {
    const query = `
        SELECT user_id 
        FROM "Comment" 
        WHERE comment_id = $1`;
    const { rows } = await pool.query(query, [comment_id]);
    return rows[0]?.user_id || null;
}

async function updateComment(comment_id, content) {
    const query = `
        UPDATE "Comment"
        SET content = $1
        WHERE comment_id = $2
        RETURNING *`;
    const { rows } = await pool.query(query, [content, comment_id]);
    return rows[0];
}

async function deleteComment(comment_id, user_id) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const query = `
            SELECT
                c.user_id AS comment_author,
                c.post_id,
                b.user_id AS post_author
            FROM "Comment" c
            JOIN "Post" p ON c.post_id = p.post_id
            JOIN "Blog" b ON p.blog_id = b.blog_id
            WHERE c.comment_id = $1`;
        const { rows } = await client.query(query, [comment_id]);
        if (rows.length === 0) throw new Error("댓글이 존재하지 않습니다");

        const { comment_author, post_author, post_id } = rows[0];
        if (user_id !== comment_author && user_id !== post_author) throw new Error("삭제 권한이 없습니다");

        await client.query(
            `DELETE FROM "Comment" 
            WHERE comment_id = $1`,
            [comment_id]
        );
        await client.query(
            `UPDATE "Post"
            SET comment_count = GREATEST(COALESCE(comment_count, 0) - 1, 0)
            WHERE post_id = $1`,
            [post_id]
        );

        await client.query("COMMIT");
        return { success: true };
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
}

module.exports = {
    getPostAuthor,
    getCommentsByPostId,
    createComment,
    getCommentAuthor,
    updateComment,
    deleteComment,
};
