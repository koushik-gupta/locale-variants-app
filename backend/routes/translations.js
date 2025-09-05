const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");
const { fetchEntry } = require("../services/contentstackService");

const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
    port: process.env.MYSQL_PORT
};

// This is our new "brain" endpoint.
// It checks the translation status of an entry against a specific variant group.
router.get("/:variantGroupId/:entryUid", async (req, res) => {
    const { variantGroupId, entryUid } = req.params;
    const contentType = req.query.contentType || 'page'; // Assume 'page' if not provided

    try {
        // Step 1: Fetch the required locales for this group from our database
        const conn = await mysql.createConnection(dbConfig);
        const [requiredLocales] = await conn.execute(
            "SELECT * FROM locales WHERE variant_group_id = ?", 
            [variantGroupId]
        );
        await conn.end();

        if (requiredLocales.length === 0) {
            return res.status(404).json({ error: "No locales found for this variant group." });
        }

        // Step 2: Fetch the entry from Contentstack to see its published languages
        const entry = await fetchEntry(contentType, entryUid);
        if (!entry) {
            return res.status(404).json({ error: "Entry not found in Contentstack." });
        }

        // Create a simple list of locales the entry is published in (e.g., ['en-US', 'hi-IN'])
        const publishedLocales = new Set(entry.publish_details.map(detail => detail.locale));

        // Step 3: Compare the two lists to determine the status of each required locale
        const translationStatus = requiredLocales.map(locale => ({
            id: locale.id,
            name: locale.name,
            status: publishedLocales.has(locale.name) ? 'Translated' : 'Missing'
        }));
        
        res.json(translationStatus);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// We are keeping the old /status route for simple testing if needed
router.get("/status", async (req, res) => {
  const { contentType, entryUid } = req.query;
  // ... (the old code remains the same)
});

module.exports = router;