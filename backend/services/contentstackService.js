const contentstack = require("contentstack");

// Log the environment variables to make SURE they are loaded correctly
console.log("--- Contentstack Service Initializing ---");
console.log("API Key:", process.env.CONTENTSTACK_API_KEY ? "Loaded" : "MISSING!");
console.log("Delivery Token:", process.env.CONTENTSTACK_DELIVERY_TOKEN ? "Loaded" : "MISSING!");
console.log("Environment:", process.env.CONTENTSTACK_ENVIRONMENT);
console.log("---------------------------------------");

const Stack = contentstack.Stack({
  api_key: process.env.CONTENTSTACK_API_KEY,
  delivery_token: process.env.CONTENTSTACK_DELIVERY_TOKEN,
  environment: process.env.CONTENTSTACK_ENVIRONMENT,
  region: "eu",
  host: "eu-cdn.contentstack.com"
});

async function fetchEntry(contentType, entryUid) {
  console.log(`Attempting to fetch entry: [Type: ${contentType}, UID: ${entryUid}]`);
  try {
    const entry = await Stack.ContentType(contentType).Entry(entryUid).fetch();
    console.log("SDK Fetch successful. Entry found.");
    return entry.toJSON();
  } catch (error) {
    // This is the most important log. It will print the full error from the SDK.
    console.error("!!! SDK FETCH FAILED !!!");
    console.error(error);
    return null;
  }
}

module.exports = { fetchEntry };