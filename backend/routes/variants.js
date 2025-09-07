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

// GET all variant groups - This route is correct.
router.get('/', async (req, res) => {
  try {
    const response = await axiosClient.get('/variant_groups');
    res.json(response.data.variant_groups || []);
  } catch (err) {
    console.error('GET /variant_groups error:', err.response?.data || { message: err.message });
    res.status(err.response?.status || 500).json({ error: 'Failed to fetch variant groups' });
  }
});

// GET a single variant group by UID - This route is correct.
router.get('/:uid', async (req, res) => {
  const { uid } = req.params;
  try {
    const response = await axiosClient.get(`/variant_groups/${uid}`);
    const variantGroupData = response.data.variant_group || response.data;
    res.json(variantGroupData);
  } catch (err) {
    console.error(`GET /variant_groups/${uid} error:`, err.response?.data || { message: err.message });
    res.status(err.response?.status || 500).json({ error: `Failed to fetch variant group ${uid}` });
  }
});

// POST route - This is correct, but will be blocked by Contentstack's API rules.
router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name) { return res.status(400).json({ error: 'Missing "name" in body' }); }
  try {
    const payload = { variant_group: { name } };
    const response = await axiosClient.post('/variant_groups', payload);
    res.status(201).json(response.data.variant_group);
  } catch (err) {
    console.error('POST /variant_groups error:', err.response?.data || { message: err.message });
    res.status(err.response?.status || 500).json({ error: 'Failed to create variant group' });
  }
});

// --- PUT Route with Enhanced Debugging ---
router.put('/:uid', async (req, res) => {
  const { uid } = req.params;
  const { locales } = req.body;
  
  console.log(`--- Starting PUT /api/variants/${uid} ---`);

  if (!locales) {
    console.log('[ERROR] Request body was missing "locales" array.');
    return res.status(400).json({ error: 'Request body must include a "locales" array.' });
  }
  
  try {
    // Step 1: Fetch the existing group to get its current name
    console.log(`[Step 1] Fetching existing group with UID: ${uid}`);
    const existingGroupResponse = await axiosClient.get(`/variant_groups/${uid}`);
    const existingGroup = existingGroupResponse.data.variant_group || existingGroupResponse.data;
    console.log(`[Step 2] Successfully fetched group. Name is: "${existingGroup.name}"`);

    // Step 2: Construct a payload that includes the name and the new metadata
    const payload = {
      variant_group: {
        name: existingGroup.name, // Include the existing name
        metadata: {
          locales: locales
        }
      }
    };
    
    console.log(`[Step 3] Sending this final payload to Contentstack: ${JSON.stringify(payload)}`);
    const response = await axiosClient.put(`/variant_groups/${uid}`, payload);
    console.log('[Step 4] Successfully updated the group in Contentstack.');
    res.json(response.data.variant_group);

  } catch (err) {
    console.error(`[CRITICAL ERROR] in PUT /variant_groups/${uid}:`, err.response?.data || { message: err.message });
    const status = err.response?.status || 500;
    res.status(status).json({ error: 'Failed to update variant group' });
  }
  
  console.log(`--- Finished PUT /api/variants/${uid} ---`);
});

module.exports = router;