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
    res.status(err.response?.status || 500).json({ error: 'Failed to fetch variant groups' });
  }
});

// GET a single variant group by UID
router.get('/:uid', async (req, res) => {
  const { uid } = req.params;
  try {
    const response = await axiosClient.get(`/variant_groups/${uid}`);
    res.json(response.data.variant_group || response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: `Failed to fetch variant group ${uid}` });
  }
});

// POST create a new variant group
router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name) { return res.status(400).json({ error: 'Missing "name" in body' }); }
  try {
    const payload = { variant_group: { name } };
    const response = await axiosClient.post('/variant_groups', payload);
    res.status(201).json(response.data.variant_group);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: 'Failed to create variant group' });
  }
});


// --- THIS IS THE FINAL, CORRECTED PUT ROUTE ---
router.put('/:uid', async (req, res) => {
  const { uid } = req.params;
  const { locales } = req.body;
  if (!locales) {
    return res.status(400).json({ error: 'Request body must include a "locales" array.' });
  }
  try {
    // WORKAROUND: Fetch ALL groups to reliably get the name for the target group.
    const allGroupsResponse = await axiosClient.get('/variant_groups');
    const allGroups = allGroupsResponse.data.variant_groups || [];
    const targetGroup = allGroups.find(group => group.uid === uid);

    if (!targetGroup) {
      return res.status(404).json({ error: `Variant group with UID ${uid} not found in the list.` });
    }

    // Now, construct the payload with the correct name.
    const payload = {
      variant_group: {
        name: targetGroup.name, // Use the name from the reliable list endpoint
        metadata: {
          locales: locales
        }
      }
    };
    
    const response = await axiosClient.put(`/variant_groups/${uid}`, payload);
    res.json(response.data.variant_group);
    
  } catch (err) {
    console.error(`PUT /variant_groups/${uid} error:`, err.response?.data || { message: err.message });
    const status = err.response?.status || 500;
    res.status(status).json({ error: 'Failed to update variant group' });
  }
});

module.exports = router;