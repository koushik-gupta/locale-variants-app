const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");

// Database configuration, same as before
const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
};

// GET endpoint to fetch all variant groups
router.get("/", async (req, res) => {
    try {
        const conn = await mysql.createConnection(dbConfig);
        // This query uses the 'variant_groups' table from your roadmap [cite: 58]
        const [rows] = await conn.execute("SELECT * FROM variant_groups ORDER BY created_at DESC");
        res.json(rows);
        await conn.end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST endpoint to create a new variant group
router.post("/", async (req, res) => {
    // We expect the request to send a 'name' for the new group
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: "Variant group name is required." });
    }

    try {
        const conn = await mysql.createConnection(dbConfig);
        // This query inserts a new 'name' into the 'variant_groups' table [cite: 61]
        const [result] = await conn.execute("INSERT INTO variant_groups (name) VALUES (?)", [name]);
        const newGroupId = result.insertId;
        res.status(201).json({ id: newGroupId, name: name });
        await conn.end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;