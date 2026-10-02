const pool = require("../config/db");

const getRecommendPosts = async () => {
    const query = `SELECT
            p.post_id,
            p.blog_id,
            p.title,
            p.subtitle,
            p.cover,
            p.created_at,
            COALESCE(COUNT(l.like_id), 0) AS like_count,
            COALESCE(p.comment_count, 0) AS comment_count,
            b.user_id, 
            u.user_name, 
            u.profile 
        FROM "Post" p 
        JOIN "Blog" b ON p.blog_id = b.blog_id 
        JOIN "User" u ON b.user_id = u.user_id 
        LEFT JOIN "Like" l ON p.post_id = l.post_id 
        GROUP BY p.post_id, b.user_id, u.user_name, u.profile 
        ORDER BY RANDOM()
        LIMIT 5;`;
    const { rows } = await pool.query(query);
    return rows;
};

const getRecommendBlogs = async () => {
    const query = `
        SELECT 
            b.*, 
            u.user_name, 
            u.profile 
        FROM "Blog" b 
        JOIN "User" u ON b.user_id = u.user_id 
        ORDER BY RANDOM() 
        LIMIT 3;`;
    const { rows } = await pool.query(query);
    return rows;
};

module.exports = {
    getRecommendPosts,
    getRecommendBlogs,
};
