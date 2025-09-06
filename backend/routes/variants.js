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
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Variant name is required." });
  }

  try {
    // --- THIS IS THE FIX ---
    // The payload for creating a variant needs to be wrapped in a "variant" object.
    const payload = {
      variant: {
        name: name
      }
    };
    // --------------------
    const response = await axiosClient.post('/variants', payload);
    res.status(201).json(response.data.variant);
  } catch (err) {
    // Log the detailed error from Contentstack's API
    console.error("Contentstack API Error:", err.response?.data?.errors || err.message);
    res.status(500).json({ error: "Failed to create variant in Contentstack." });
  }
});

module.exports = router;