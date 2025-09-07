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
  // This route is working, no changes needed.
  try {
    const response = await axiosClient.get('/variant_groups');
    res.json(response.data.variant_groups || []);
  } catch (err) {
    console.error('GET /variant_groups error:', err.response?.data || { message: err.message });
    const status = err.response?.status || 500;
    const detail = err.response?.data || { message: 'An unexpected error occurred' };
    res.status(status).json({ error: 'Failed to fetch variant groups', detail });
  }
});

// GET a single variant group by UID
router.get('/:uid', async (req, res) => {
  const { uid } = req.params;
  console.log(`--- Starting GET /api/variants/${uid} ---`);
  try {
    console.log(`[Step 1] Inside try block for ${uid}.`);
    console.log('[Step 2] About to call Contentstack API...');

    const response = await axiosClient.get(`/variant_groups/${uid}`);

    console.log('[Step 3] Successfully received response from Contentstack.');
    res.json(response.data.variant_group);
    
  } catch (err) {
    console.error(`[CRITICAL ERROR] in GET /variant_groups/${uid}:`, err.response?.data || { message: err.message, code: err.code });
    const status = err.response?.status || 500;
    const detail = err.response?.data || { message: `An unexpected error occurred: ${err.message}` };
    res.status(status).json({ error: `Failed to fetch variant group ${uid}`, detail });
  }
  console.log(`--- Finished GET /api/variants/${uid} ---`);
});

// Other routes (POST, PUT) remain the same...

// POST create a new variant group
router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Missing "name" in body' });
  }
  try {
    const payload = { variant_group: { name } };
    const response = await axiosClient.post('/variant_groups', payload);
    res.status(201).json(response.data.variant_group);
  } catch (err) {
    console.error('POST /variant_groups error:', err.response?.data || { message: err.message });
    const status = err.response?.status || 500;
    const detail = err.response?.data || { message: 'An unexpected error occurred' };
    res.status(status).json({ error: 'Failed to create variant group', detail });
  }
});

// PUT update a variant group
router.put('/:uid', async (req, res) => {
  const { uid } = req.params;
  const { locales } = req.body;
  if (!locales) {
    return res.status(400).json({ error: 'Request body must include a "locales" array.' });
  }
  try {
    const payload = { variant_group: { metadata: { locales: locales } } };
    const response = await axiosClient.put(`/variant_groups/${uid}`, payload);
    res.json(response.data.variant_group);
  } catch (err) {
    console.error(`PUT /variant_groups/${uid} error:`, err.response?.data || { message: err.message });
    const status = err.response?.status || 500;
    const detail = err.response?.data || { message: 'An unexpected error occurred' };
    res.status(status).json({ error: 'Failed to update variant group', detail });
  }
});

module.exports = router;