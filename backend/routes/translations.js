const express = require("express");
const router = express.Router();

// This route will be built out later to check translation status.
router.get("/status", async (req, res) => {
  // TODO: Implement the logic to check translation status against Contentstack
  res.json({ message: "Endpoint for checking translation status." });
});

module.exports = router;