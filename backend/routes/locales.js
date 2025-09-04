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

// NEW: GET endpoint to fetch all locales FOR A SPECIFIC GROUP
// The ":groupId" is a URL parameter that will hold the ID of the variant group
router.get("/:groupId", async (req, res) => {
    const { groupId } = req.params; // Get the group ID from the URL

    try {
        const conn = await mysql.createConnection(dbConfig);
        // This query now filters by the variant_group_id
        const [rows] = await conn.execute("SELECT * FROM locales WHERE variant_group_id = ?", [groupId]);
        res.json(rows);
        await conn.end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// NEW: POST endpoint to create a new locale within a group
router.post("/", async (req, res) => {
    // We expect the name, the group ID it belongs to, and an optional fallback ID
    const { variant_group_id, name, fallback_to } = req.body;

    if (!variant_group_id || !name) {
        return res.status(400).json({ error: "variant_group_id and name are required." });
    }

    try {
        const conn = await mysql.createConnection(dbConfig);
        // This query inserts a new row into the 'locales' table
        const [result] = await conn.execute(
            "INSERT INTO locales (variant_group_id, name, fallback_to) VALUES (?, ?, ?)",
            [variant_group_id, name, fallback_to || null] // Use null if fallback_to is not provided
        );
        
        const newLocaleId = result.insertId;
        res.status(201).json({ id: newLocaleId, variant_group_id, name, fallback_to });
        await conn.end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;