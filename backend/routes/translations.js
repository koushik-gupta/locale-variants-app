// routes/translations.js
const express = require("express");
const router = express.Router();
const axios = require("axios");

const API_KEY = process.env.CONTENTSTACK_API_KEY;
const MANAGEMENT_TOKEN = process.env.CONTENTSTACK_MANAGEMENT_TOKEN;
const DELIVERY_TOKEN = process.env.CONTENTSTACK_DELIVERY_TOKEN;
const ENVIRONMENT = process.env.CONTENTSTACK_ENVIRONMENT;

const MGMT_API_HOST = 'https://eu-api.contentstack.com/v3';
const DLV_API_HOST = "https://eu-cdn.contentstack.com/v3";

const managementClient = axios.create({
  baseURL: MGMT_API_HOST,
  headers: { 'api_key': API_KEY, 'authorization': MANAGEMENT_TOKEN }
});

const deliveryClient = axios.create({
  baseURL: DLV_API_HOST,
  headers: { 'api_key': API_KEY, 'access_token': DELIVERY_TOKEN }
});

router.get("/status", async (req, res) => {
  const { variantUid, entryUid, contentType } = req.query;
  if (!variantUid || !entryUid || !contentType) {
    return res.status(400).json({ error: "variantUid, entryUid, and contentType are required." });
  }
  try {
    // Fetch from /variant_groups endpoint
    const variantResponse = await managementClient.get(`/variant_groups/${variantUid}`);
    // Read locales from the 'metadata' property
    const localeRules = variantResponse.data.variant_group.metadata?.locales || [];
    
    if (localeRules.length === 0) {
      return res.json([]);
    }

    const entryResponse = await deliveryClient.get(`/content_types/${contentType}/entries/${entryUid}?environment=${ENVIRONMENT}&include_publish_details=true`);
    const publishedLocales = new Set(entryResponse.data.entry.publish_details.map(d => d.locale));

    const translationStatus = localeRules.map(rule => ({
      name: rule.name,
      code: rule.code,
      status: publishedLocales.has(rule.code) ? 'Translated' : 'Missing'
    }));
    
    res.json(translationStatus);
  } catch (err) {
    console.error("Contentstack API Error in /translations/status:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to get translation status." });
  }
});

module.exports = router;