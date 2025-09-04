const contentstack = require("contentstack");

// This is the correct syntax for the v3 SDK, which is a function call
const Stack = contentstack.Stack({
  api_key: process.env.CONTENTSTACK_API_KEY,
  delivery_token: process.env.CONTENTSTACK_DELIVERY_TOKEN,
  environment: process.env.CONTENTSTACK_ENVIRONMENT,
  region: "eu",
  host: "eu-cdn.contentstack.com"
});

/**
 * A function to fetch a single entry using the v3 SDK.
 */
async function fetchEntry(contentType, entryUid) {
  try {
    // The v3 SDK uses a builder pattern that ends with .fetch()
    const entry = await Stack.ContentType(contentType)
      .Entry(entryUid)
      .toJSON() // Add .toJSON() before .fetch() for a clean object
      .fetch();

    return entry;
  } catch (error) {
    console.error(`!!! SDK V3 FETCH FAILED !!! for ${entryUid}`, error);
    return null;
  }
}

module.exports = { fetchEntry };