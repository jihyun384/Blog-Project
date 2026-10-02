const pool = require("../config/db");

exports.followUser = async (follower_user_id, following_user_id) => {
    const result = await pool.query(
        `INSERT INTO "Follower" (follower_user_id, following_user_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
         RETURNING *`,
        [follower_user_id, following_user_id]
    );
    return result.rows[0];
};

exports.unfollowUser = async (follower_user_id, following_user_id) => {
    const result = await pool.query(
        `DELETE FROM "Follower"
        WHERE follower_user_id = $1 AND following_user_id = $2
         RETURNING *`,
        [follower_user_id, following_user_id]
    );
    return result.rows[0];
};

exports.isFollowing = async (follower_user_id, following_user_id) => {
    const result = await pool.query(
        `SELECT 1 
        FROM "Follower"
        WHERE follower_user_id = $1 AND following_user_id = $2`,
        [follower_user_id, following_user_id]
    );
    return result.rows.length > 0;
};

exports.getFollowCount = async (user_id) => {
    const result = await pool.query(
        `SELECT
            (SELECT COUNT(*) FROM "Follower" WHERE following_user_id = $1) AS followers,
            (SELECT COUNT(*) FROM "Follower" WHERE follower_user_id = $1) AS followings`,
        [user_id]
    );
    return result.rows[0];
};
