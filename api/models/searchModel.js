const pool = require("../config/db");

exports.findPostsByKeyword = async (keyword) => {
    const query = `
        SELECT 
            p.post_id, 
            p.blog_id, 
            p.title, 
            p.subtitle, 
            p.cover, 
            p.created_at, 
            COALESCE(COUNT(l.like_id), 0) AS like_count,
            COALESCE(p.comment_count, 0) AS comment_count, 
            u.user_name 
        FROM "Post" p 
        JOIN "Blog" b ON p.blog_id = b.blog_id 
        JOIN "User" u ON b.user_id = u.user_id 
        LEFT JOIN "Like" l ON p.post_id = l.post_id 
        WHERE p.title ILIKE $1 OR p.subtitle ILIKE $2 OR u.user_name ILIKE $3 
        GROUP BY p.post_id, b.blog_id, u.user_name`;
    const { rows } = await pool.query(query, [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]);
    return rows;
};

exports.findBlogsByUserName = async (keyword) => {
    const query = `
        SELECT 
            b.blog_id, 
            b.title, 
            u.user_id, 
            u.user_name, 
            u.profile 
        FROM "Blog" b 
        JOIN "User" u ON b.user_id = u.user_id 
        WHERE u.user_name ILIKE $1 OR b.title ILIKE $2`;
    const { rows } = await pool.query(query, [`%${keyword}%`, `%${keyword}%`]);
    return rows;
};
