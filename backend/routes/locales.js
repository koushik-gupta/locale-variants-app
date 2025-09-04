const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");

const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
    port: process.env.MYSQL_PORT
};

router.get("/", async (req, res) => {
    try {
        const conn = await mysql.createConnection(dbConfig);
        const [rows] = await conn.execute("SELECT * FROM locales");
        res.json(rows);
        await conn.end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;