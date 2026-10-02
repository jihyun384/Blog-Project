const pool = require("../config/db");

const createBlog = async (user_id, title, description) => {
    const result = await pool.query(
        `INSERT INTO "Blog" (user_id, title, description, created_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING blog_id, user_id, title, description, created_at`,
        [user_id, title, description]
    );
    return result.rows[0];
};

const findBlogByUserId = async (user_id) => {
    const result = await pool.query(
        `SELECT * 
        FROM "Blog" 
        WHERE user_id = $1`,
        [user_id]
    );
    return result.rows[0];
};

const findBlogById = async (blog_id) => {
    const result = await pool.query(
        `SELECT 
            b.*, 
            u.user_name, 
            u.profile
        FROM "Blog" b
        JOIN "User" u ON b.user_id = u.user_id
        WHERE b.blog_id = $1`,
        [blog_id]
    );
    return result.rows[0];
};

const updateBlog = async (user_id, title, description) => {
    const result = await pool.query(
        `UPDATE "Blog"
        SET title = $1, description = $2
        WHERE user_id = $3
        RETURNING blog_id, user_id, title, description, created_at`,
        [title, description, user_id]
    );
    return result.rows[0];
};

const getPostsByBlogId = async (blog_id) => {
    const result = await pool.query(
        `SELECT
            p.post_id,
            p.title,
            p.subtitle,
            p.cover,
            p.created_at,
            COALESCE(COUNT(l.like_id), 0) AS like_count,
            COALESCE(p.comment_count, 0) AS comment_count,
            u.user_name,
            u.profile
        FROM "Post" p
        JOIN "Blog" b ON p.blog_id = b.blog_id
        JOIN "User" u ON b.user_id = u.user_id
        LEFT JOIN "Like" l ON p.post_id = l.post_id
        WHERE p.blog_id = $1
        GROUP BY p.post_id, b.blog_id, u.user_name, u.profile
        ORDER BY p.created_at DESC`,
        [blog_id]
    );
    return result.rows;
};

const getCategoriesByBlogId = async (blog_id) => {
    const result = await pool.query(
        `SELECT DISTINCT
            c.category_id,
            c.name
        FROM "Category" c
        JOIN "PostCategory" pc ON c.category_id = pc.category_id
        JOIN "Post" p ON pc.post_id = p.post_id
        WHERE p.blog_id = $1
        ORDER BY c.name ASC`,
        [blog_id]
    );
    return result.rows;
};

const getPostsByCategory = async (blog_id, category_id) => {
    const result = await pool.query(
        `SELECT 
            p.post_id,
            p.title,
            p.subtitle,
            p.cover,
            p.created_at,
            COALESCE(COUNT(l.like_id), 0) AS like_count,
            COALESCE(p.comment_count, 0) AS comment_count
        FROM "Post" p
        JOIN "PostCategory" pc ON p.post_id = pc.post_id
        LEFT JOIN "Like" l ON p.post_id = l.post_id
        WHERE p.blog_id = $1 AND pc.category_id = $2
        GROUP BY p.post_id
        ORDER BY p.created_at DESC`,
        [blog_id, category_id]
    );
    return result.rows;
};

module.exports = {
    createBlog,
    findBlogByUserId,
    findBlogById,
    updateBlog,
    getPostsByBlogId,
    getCategoriesByBlogId,
    getPostsByCategory,
};
