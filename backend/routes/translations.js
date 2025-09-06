// routes/translations.js
const express = require("express");
const router = express.Router();
const axios = require("axios");

// --- Contentstack API Configuration ---
const API_KEY = process.env.CONTENTSTACK_API_KEY;
const MANAGEMENT_TOKEN = process.env.CONTENTSTACK_MANAGEMENT_TOKEN;
const DELIVERY_TOKEN = process.env.CONTENTSTACK_DELIVERY_TOKEN;
const ENVIRONMENT = process.env.CONTENTSTACK_ENVIRONMENT;

// CORRECT: Use the Personalize API host to get variant rules
const PERSONALIZE_API_HOST = 'https://eu-api.contentstack.com/v3';
const DLV_API_HOST = "https://eu-cdn.contentstack.com/v3";

// Axios client for Personalize API (to get locale rules)
const personalizeClient = axios.create({
  baseURL: PERSONALIZE_API_HOST,
  headers: {
    'api_key': API_KEY,
    'authorization': MANAGEMENT_TOKEN
  }
});

// Axios client for Delivery API (to get entry details)
const deliveryClient = axios.create({
  baseURL: DLV_API_HOST,
  headers: {
    'api_key': API_KEY,
    'access_token': DELIVERY_TOKEN
  }
});
// ------------------------------------

router.get("/status", async (req, res) => {
  const { variantUid, entryUid, contentType } = req.query;

  if (!variantUid || !entryUid || !contentType) {
    return res.status(400).json({ error: "variantUid, entryUid, and contentType are required." });
  }

  try {
    // Step 1: Get the variant rules from the Personalize API
    const variantResponse = await personalizeClient.get(`/personalize/variants/${variantUid}`);
    const localeRules = variantResponse.data.variant.scope.locales; // e.g., [{ code: 'mr-IN', name: 'Marathi'}]
    
    // If there are no rules, there's nothing to check
    if (!localeRules || localeRules.length === 0) {
      return res.json([]);
    }

    // Step 2: Get the entry to see which locales it's published in
    const entryResponse = await deliveryClient.get(`/content_types/${contentType}/entries/${entryUid}?environment=${ENVIRONMENT}&include_publish_details=true`);
    const publishedLocales = new Set(entryResponse.data.entry.publish_details.map(d => d.locale));

    // Step 3: Compare the rules against the published locales
    const translationStatus = localeRules.map(rule => ({
      name: rule.name, // Display the friendly name (e.g., "Marathi")
      code: rule.code, // Keep the code for reference (e.g., "mr-IN")
      status: publishedLocales.has(rule.code) ? 'Translated' : 'Missing'
    }));
    
    res.json(translationStatus);

  } catch (err) {
    console.error("Contentstack API Error in /translations/status:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to get translation status." });
  }
});

module.exports = router;