// routes/variants.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

const API_KEY = process.env.CONTENTSTACK_API_KEY;
const MANAGEMENT_TOKEN = process.env.CONTENTSTACK_MANAGEMENT_TOKEN;
const API_HOST = 'https://eu-api.contentstack.com/v3';

const axiosClient = axios.create({
  baseURL: API_HOST,
  headers: {
    'api_key': API_KEY,
    'authorization': MANAGEMENT_TOKEN,
    'Content-Type': 'application/json'
  }
});

// GET all variant groups
router.get('/', async (req, res) => {
  try {
    const response = await axiosClient.get('/variant_groups');
    res.json(response.data.variant_groups || []);
  } catch (err) {
    console.error('GET /variant_groups error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ error: 'Failed to fetch variant groups' });
  }
});

// POST create a new variant group
router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Missing "name" in body' });
  }
  try {
    // Use the 'variant_group' payload structure
    const payload = {
      variant_group: {
        name
      }
    };
    console.log('[Debug] Sending payload to Contentstack:', JSON.stringify(payload));
    const response = await axiosClient.post('/variant_groups', payload);
    res.status(201).json(response.data.variant_group);
  } catch (err) {
    console.error('POST /variant_groups error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ error: 'Failed to create variant group', detail: err.response?.data });
  }
});

// PUT update a variant group (to add locale rules to metadata)
router.put('/:uid', async (req, res) => {
  const { uid } = req.params;
  const { locales } = req.body;
  if (!locales) {
    return res.status(400).json({ error: 'Request body must include a "locales" array.' });
  }
  try {
    // Use the 'variant_group' payload with 'metadata'
    const payload = {
      variant_group: {
        metadata: {
          locales: locales
        }
      }
    };
    console.log(`[Debug] PUT /variant_groups/${uid} payload:`, JSON.stringify(payload));
    const response = await axiosClient.put(`/variant_groups/${uid}`, payload);
    res.json(response.data.variant_group);
  } catch (err) {
    console.error(`PUT /variant_groups/${uid} error:`, err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ error: 'Failed to update variant group', detail: err.response?.data });
  }
});

module.exports = router;