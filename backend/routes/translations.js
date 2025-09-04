const express = require("express");
const router = express.Router();
const { fetchEntry } = require("../services/contentstackService");

router.get("/status", async (req, res) => {
  const { contentType, entryUid } = req.query;
  
  // Log the incoming request details
  console.log(`--- Received request for /api/translations/status ---`);
  console.log("Query Params:", req.query);
  console.log("-------------------------------------------------");

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