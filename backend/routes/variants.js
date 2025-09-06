const express = require("express");
const router = express.Router();
const axios = require("axios");

const API_KEY = process.env.CONTENTSTACK_API_KEY;
const MANAGEMENT_TOKEN = process.env.CONTENTSTACK_MANAGEMENT_TOKEN;
const API_HOST = "https://eu-api.contentstack.com/v3";

const axiosClient = axios.create({
  baseURL: API_HOST,
  headers: {
    api_key: API_KEY,
    authorization: MANAGEMENT_TOKEN,
    'Content-Type': 'application/json'
  }
});

router.get("/", async (req, res) => {
  try {
    const response = await axiosClient.get('/variants');
    res.json(response.data.variants);
  } catch (err) {
    console.error("Contentstack API Error:", err.response?.data);
    res.status(500).json({ error: "Failed to fetch variants from Contentstack." });
  }
});

// POST endpoint to create a new variant
router.post("/", async (req, res) => {
  // --- DEBUG STEP 1 ---
  // Log the raw incoming request body to ensure it's being parsed correctly.
  console.log("[Debug Step 1] Received incoming request body:", JSON.stringify(req.body));
  
  const { name } = req.body;
  if (!name) {
    console.log("[Debug Step 1b] Validation failed: Name is missing from body.");
    return res.status(400).json({ error: "Variant name is required." });
  }

  try {
    // --- DEBUG STEP 2 ---
    // Define the payload structure that we believe is correct.
    const payload = {
      variant: {
        name: name
      }
    };
    
    // Log the exact payload we are about to send to Contentstack.
    console.log("[Debug Step 2] Sending this payload to Contentstack:", JSON.stringify(payload));

    const response = await axiosClient.post('/variants', payload);
    
    console.log("[Debug Step 3] Contentstack API call successful.");
    res.status(201).json(response.data.variant);

  } catch (err) {
    // --- DEBUG STEP 4 ---
    // Log the error received from Contentstack.
    const errorMessage = err.response?.data || { message: err.message };
    console.error("[Debug Step 4] Error caught during Contentstack API call:", JSON.stringify(errorMessage));
    res.status(500).json({ error: "Failed to create variant in Contentstack." });
  }
});

module.exports = router;