const pool = require("../config/db");

exports.createUser = async (user_name, email, password, profile = "profile.png") => {
    const result = await pool.query(
        `INSERT INTO "User" (user_name, email, password, profile, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING user_id, user_name, email, profile`,
        [user_name, email, password, profile]
    );
    return result.rows[0];
};

exports.findUserByEmail = async (email) => {
    const result = await pool.query(
        `SELECT * 
        FROM "User" 
        WHERE email = $1`,
        [email]
    );
    return result.rows[0];
};

exports.findUserById = async (user_id) => {
    const result = await pool.query(
        `SELECT * 
        FROM "User" 
        WHERE user_id = $1`,
        [user_id]
    );
    return result.rows[0];
};

exports.updateUserProfile = async (user_id, user_name, email) => {
    const result = await pool.query(
        `UPDATE "User"
        SET user_name = $1, email = $2
        WHERE user_id = $3
        RETURNING user_id, user_name, email, profile`,
        [user_name, email, user_id]
    );
    return result.rows[0];
};

exports.updateProfilePhoto = async (user_id, filename) => {
    const result = await pool.query(
        `UPDATE "User"
        SET profile = $1
        WHERE user_id = $2
        RETURNING user_id, user_name, email, profile`,
        [filename, user_id]
    );
    return result.rows[0];
};
