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

// NEW - This replaces the old /:variantGroupId/:entryUid route
router.get("/status", async (req, res) => {
    // We get all the data from query parameters now
    const { variantGroupId, entryUid, contentType } = req.query;

    if (!variantGroupId || !entryUid || !contentType) {
        return res.status(400).json({ error: "variantGroupId, entryUid, and contentType are required." });
    }

    try {
        const conn = await mysql.createConnection(dbConfig);
        const [requiredLocales] = await conn.execute(
            "SELECT * FROM locales WHERE variant_group_id = ?", 
            [variantGroupId]
        );
        await conn.end();

        if (requiredLocales.length === 0) {
            return res.status(404).json({ error: "No locales found for this variant group." });
        }

        const entry = await fetchEntry(contentType, entryUid);
        if (!entry) {
            return res.status(404).json({ error: "Entry not found in Contentstack." });
        }

        let publishedLocales = new Set();
        if (Array.isArray(entry.publish_details)) {
            publishedLocales = new Set(entry.publish_details.map(detail => detail.locale));
        } else if (entry.locale) {
            publishedLocales.add(entry.locale);
        }

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
  if (!contentType || !entryUid) {
    return res.status(400).json({ error: "contentType and entryUid query parameters are required." });
  }
  try {
    const entry = await fetchEntry(contentType, entryUid);
    if (entry) {
      res.json({
        uid: entry.uid,
        title: entry.title,
        message: "Entry found successfully in Contentstack.",
      });
    } else {
      res.status(404).json({ error: "Entry not found in Contentstack." });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;