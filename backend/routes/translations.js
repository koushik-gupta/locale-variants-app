const express = require("express");
const router = express.Router();
// Import the fetchEntry function from our new service
const { fetchEntry } = require("../services/contentstackService");

// This route will check the status of a specific entry in Contentstack
// Example URL: GET /api/translations/status?contentType=page&entryUid=blt123abc...
router.get("/status", async (req, res) => {
  const { contentType, entryUid } = req.query;

  if (!contentType || !entryUid) {
    return res.status(400).json({ error: "contentType and entryUid query parameters are required." });
  }

  try {
    const entry = await fetchEntry(contentType, entryUid);

    if (entry) {
      // Success! We found the entry in Contentstack.
      // For now, we'll just return its title to confirm it worked.
      res.json({
        uid: entry.uid,
        title: entry.title,
        message: "Entry found successfully in Contentstack.",
      });
    } else {
      // The entry was not found.
      res.status(404).json({ error: "Entry not found in Contentstack." });
    }
  } catch (err) {
    // A server error occurred.
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;