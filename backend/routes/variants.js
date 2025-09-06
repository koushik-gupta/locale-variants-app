// routes/variants.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

const API_KEY = process.env.CONTENTSTACK_API_KEY;
const MANAGEMENT_TOKEN = process.env.CONTENTSTACK_MANAGEMENT_TOKEN;
// CORRECT: Use the Personalize API host for your region (EU)
const API_HOST = 'https://eu-api.contentstack.com/v3';

const axiosClient = axios.create({
  baseURL: API_HOST,
  headers: {
    'api_key': API_KEY,
    'authorization': MANAGEMENT_TOKEN,
    'Content-Type': 'application/json'
  }
});

// GET all variants
router.get('/', async (req, res) => {
  try {
    // CORRECT: Use the /personalize/variants endpoint
    const response = await axiosClient.get('/personalize/variants');
    res.json(response.data.variants || []);
  } catch (err) {
    console.error('GET /personalize/variants error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ error: 'Failed to fetch variants' });
  }
});

// POST create a new variant
router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Missing "name" in body' });
  }

  try {
    // CORRECT: Use the required payload structure with "scope"
    const payload = {
      variant: {
        name,
        scope: {
          locales: [] // Start with an empty locales array
        }
      }
    };
    console.log('[Debug] Sending payload to Contentstack:', JSON.stringify(payload));
    
    // CORRECT: Use the /personalize/variants endpoint
    const response = await axiosClient.post('/personalize/variants', payload);
    res.status(201).json(response.data.variant);

  } catch (err) {
    console.error('POST /personalize/variants error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ error: 'Failed to create variant', detail: err.response?.data });
  }
});

// PUT update a variant (to add locale rules)
router.put('/:uid', async (req, res) => {
  const { uid } = req.params;
  const { locales } = req.body; // Expecting an array like [{ code: 'mr-in', fallback: 'hi-in' }]

  if (!locales) {
    return res.status(400).json({ error: 'Request body must include a "locales" array.' });
  }

  try {
    // To update, we must first FETCH the existing variant to get its current state
    const existingVariantResponse = await axiosClient.get(`/personalize/variants/${uid}`);
    const existingVariant = existingVariantResponse.data.variant;

    // Now, construct the update payload
    const payload = {
      variant: {
        name: existingVariant.name, // Name is required on update
        scope: {
          ...existingVariant.scope, // Preserve existing scope properties
          locales: locales // Overwrite with the new locales array
        }
      }
    };

    console.log(`[Debug] PUT /personalize/variants/${uid} payload:`, JSON.stringify(payload));
    const response = await axiosClient.put(`/personalize/variants/${uid}`, payload);
    res.json(response.data.variant);

  } catch (err) {
    console.error(`PUT /personalize/variants/${uid} error:`, err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ error: 'Failed to update variant', detail: err.response?.data });
  }
});

module.exports = router;