// backend/routes/translations.js

const express = require("express");
const router = express.Router();
const axios = require("axios");

// --- Environment Variables ---
const API_KEY = process.env.CONTENTSTACK_API_KEY;
const MANAGEMENT_TOKEN = process.env.CONTENTSTACK_MANAGEMENT_TOKEN;
const DELIVERY_TOKEN = process.env.CONTENTSTACK_DELIVERY_TOKEN;
const ENVIRONMENT = process.env.CONTENTSTACK_ENVIRONMENT;

// --- API Host Configuration ---
const MGMT_API_HOST = 'https://eu-api.contentstack.com/v3';
const DLV_API_HOST = "https://eu-cdn.contentstack.com/v3";

// --- Axios Clients ---
// Client for Management API (Create, Update, Delete operations)
const managementClient = axios.create({
  baseURL: MGMT_API_HOST,
  headers: {
    'api_key': API_KEY,
    'authorization': MANAGEMENT_TOKEN,
    'Content-Type': 'application/json'
  }
});

// Client for Delivery API (Read published content)
const deliveryClient = axios.create({
  baseURL: DLV_API_HOST,
  headers: {
    'api_key': API_KEY,
    'access_token': DELIVERY_TOKEN
  }
});

/**
 * GET /status
 * Checks the translation status for all locales defined in a variant group against a specific entry.
 */
router.get("/status", async (req, res) => {
  const { variantUid, entryUid, contentType } = req.query;
  console.log(`[Debug Status] Received request for entry: ${entryUid}, variant group: ${variantUid}`);

  if (!variantUid || !entryUid || !contentType) {
    return res.status(400).json({ error: "variantUid, entryUid, and contentType are required." });
  }

  try {
    // --- Resilient Fetch Logic ---
    // Fetch ALL groups instead of a single one to avoid potential API bug on GET /:uid.
    const allGroupsResponse = await managementClient.get('/variant_groups');
    const allGroups = allGroupsResponse.data.variant_groups || [];
    const targetGroup = allGroups.find(group => group.uid === variantUid);

    if (!targetGroup) {
      console.error(`[Debug Status] Variant group ${variantUid} not found.`);
      return res.status(404).json({ error: `Variant group with UID ${variantUid} not found.` });
    }
    
    // Read locale rules from the variant group's metadata.
    const localeRules = targetGroup.metadata?.locales || [];
    console.log(`[Debug Status] Found ${localeRules.length} locale rules for this group.`);

    // --- Entry Publish Status Check ---
    // Fetch entry details from Delivery API to see which locales are published.
    const entryResponse = await deliveryClient.get(`/content_types/${contentType}/entries/${entryUid}?environment=${ENVIRONMENT}&include_publish_details=true`);
    const publishedLocales = new Set(entryResponse.data.entry.publish_details.map(d => d.locale));
    console.log(`[Debug Status] Entry has published locales:`, Array.from(publishedLocales));

    // Compare rules to published status.
    const translationStatus = localeRules.map(rule => ({
      name: rule.name,
      code: rule.code,
      status: publishedLocales.has(rule.code) ? 'Translated' : 'Missing'
    }));
    
    console.log("[Debug Status] Final calculated status:", translationStatus);
    res.json(translationStatus);

  } catch (err) {
    console.error("Contentstack API Error in /translations/status:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to get translation status." });
  }
});

/**
 * POST /generate
 * Placeholder for AI translation generation (Roadmap Step 3).
 */
router.post("/generate", async (req, res) => {
    // To be implemented later:
    // 1. Get source text, source locale, target locale from req.body.
    // 2. Call OpenAI API to perform translation.
    // 3. Use managementClient.put() to save the new translation back into the Contentstack entry.
    console.log("[Info] AI generation endpoint called, but not yet implemented.");
    res.status(501).json({ message: "AI generation endpoint not implemented yet." });
});


module.exports = router;