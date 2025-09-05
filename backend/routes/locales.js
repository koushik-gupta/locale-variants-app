const express = require("express");
const router = express.Router();

// This route will be built out later to manage locales within a variant.
// For example, GET /api/locales/variant-uid-123
router.get("/:variantUid", async (req, res) => {
  // TODO: Fetch locale rules for a variant from Contentstack
  res.json({ message: "Endpoint for fetching locales for a variant." });
});

module.exports = router;