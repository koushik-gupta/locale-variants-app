const contentstack = require("contentstack");

// The corrected syntax: Using "new" with the original "Stack" class
const Stack = new contentstack.Stack({
  api_key: process.env.CONTENTSTACK_API_KEY,
  delivery_token: process.env.CONTENTSTACK_DELIVERY_TOKEN,
  environment: process.env.CONTENTSTACK_ENVIRONMENT,
  region: "eu",
  host: "eu-cdn.contentstack.com"
});

/**
 * A function to fetch a single entry from a specific content type.
 */
async function fetchEntry(contentType, entryUid) {
  try {
    // This is the correct way to fetch using the "Stack" object
    const entry = await Stack.ContentType(contentType)
      .Entry(entryUid)
      .fetch();
    
    // Use .toJSON() to get a clean object with this version
    return entry.toJSON();
  } catch (error) {
    console.error(`!!! SDK FETCH FAILED !!! for ${entryUid}`, error);
    return null;
  }
}

module.exports = { fetchEntry };