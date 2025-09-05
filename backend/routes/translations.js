const express = require("express");
const router = express.Router();
const axios = require("axios");

// --- Contentstack API Configuration ---
const API_KEY = process.env.CONTENTSTACK_API_KEY;
const MANAGEMENT_TOKEN = process.env.CONTENTSTACK_MANAGEMENT_TOKEN;
const DELIVERY_TOKEN = process.env.CONTENTSTACK_DELIVERY_TOKEN;
const ENVIRONMENT = process.env.CONTENTSTACK_ENVIRONMENT;
const MGMT_API_HOST = "https://eu-api.contentstack.com/v3";
const DLV_API_HOST = "https://eu-cdn.contentstack.com/v3";

// Axios client for Management API (to get locale rules)
const managementClient = axios.create({
  baseURL: MGMT_API_HOST,
  headers: {
    api_key: API_KEY,
    authorization: MANAGEMENT_TOKEN
  }
});

// Axios client for Delivery API (to get entry details)
const deliveryClient = axios.create({
  baseURL: DLV_API_HOST,
  headers: {
    api_key: API_KEY,
    access_token: DELIVERY_TOKEN
  }
});
// ------------------------------------

router.get("/status", async (req, res) => {
  const { variantGroupId, entryUid, contentType } = req.query;

  if (!variantGroupId || !entryUid || !contentType) {
    return res.status(400).json({ error: "variantGroupId, entryUid, and contentType are required." });
  }

  try {
    // For this hackathon, we assume the variant group name IS the fallback rule.
    // e.g., "mr-IN_hi-IN_en-US". A full app would have a more complex rule system.
    const variantResponse = await managementClient.get(`/variants/${variantGroupId}`);
    const variantName = variantResponse.data.variant.name;
    const requiredLocales = variantName.split('_'); // e.g., ['mr-IN', 'hi-IN', 'en-US']

    // Get the entry to see which locales it's published in
    const entryResponse = await deliveryClient.get(`/content_types/${contentType}/entries/${entryUid}?environment=${ENVIRONMENT}`);
    const publishedLocales = new Set(entryResponse.data.entry.publish_details.map(d => d.locale));

    // Compare the two lists
    const translationStatus = requiredLocales.map(localeName => ({
      name: localeName,
      status: publishedLocales.has(localeName) ? 'Translated' : 'Missing'
    }));
    
    res.json(translationStatus);

  } catch (err) {
    console.error("Contentstack API Error in /translations/status:", err.response?.data);
    res.status(500).json({ error: "Failed to get translation status." });
  }
});

module.exports = router;