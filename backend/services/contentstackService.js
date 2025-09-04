const contentstack = require("contentstack");

// This is the modern (v4) way to initialize the SDK
const client = new contentstack.Client({
  // The Stack API Key (notice it's apiKey, not api_key)
  apiKey: process.env.CONTENTSTACK_API_KEY,
  // The Delivery Token for the environment
  deliveryToken: process.env.CONTENTSTACK_DELIVERY_TOKEN,
  // The environment name
  environment: process.env.CONTENTSTACK_ENVIRONMENT,
  // The region for your Stack
  region: "eu",
  // The host override we discovered
  host: "eu-cdn.contentstack.com",
});

/**
 * A function to fetch a single entry using the modern SDK.
 */
async function fetchEntry(contentType, entryUid) {
  try {
    const entry = await client
      .stack()
      .contentType(contentType)
      .entry(entryUid)
      .fetch();
    
    // The new SDK returns a clean object, no need for .toJSON()
    return entry;
  } catch (error) {
    // Log the error to see details if it fails
    console.error(`!!! SDK V4 FETCH FAILED !!! for ${entryUid}`, error);
    return null;
  }
}

module.exports = { fetchEntry };