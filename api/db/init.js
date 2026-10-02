const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

(async () => {
    const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query("COMMIT");

        const { rows } = await client.query(
            `SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'blog'
            ORDER BY table_name`
        );
        console.log("테이블 생성 완료:", rows.map((r) => r.table_name).join(", "));
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("테이블 생성 실패:", err.message);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
})();
