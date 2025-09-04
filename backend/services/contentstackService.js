const contentstack = require("contentstack");

// This initializes the connection to your Contentstack Stack
// It uses the environment variables you already set up in Railway
const Stack = contentstack.Stack({
  api_key: process.env.CONTENTSTACK_API_KEY,
  delivery_token: process.env.CONTENTSTACK_DELIVERY_TOKEN,
  environment: process.env.CONTENTSTACK_ENVIRONMENT,
  region: "eu",
});

/**
 * A function to fetch a single entry from a specific content type.
 * @param {string} contentType - The API key of the content type.
 * @param {string} entryUid - The UID of the entry to fetch.
 * @returns {Promise<object|null>} The entry object or null if not found.
 */
async function fetchEntry(contentType, entryUid) {
  try {
    const entry = await Stack.ContentType(contentType).Entry(entryUid).fetch();
    return entry.toJSON(); // .toJSON() gives us a clean JavaScript object
  } catch (error) {
    console.error(`Error fetching entry ${entryUid} from ${contentType}:`, error);
    return null; // Return null if there's an error (e.g., entry not found)
  }
}

// We will add more functions here later
module.exports = { fetchEntry };