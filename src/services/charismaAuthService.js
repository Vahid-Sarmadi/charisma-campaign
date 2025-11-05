/**
 * charismaAuthService.js
 * Handles authentication with Charisma OAuth2 API
 * Equivalent to Python's BearerAuth class
 */

const axios = require("axios");
const https = require("https");

const CHARISMA_AUTH_URL =
  process.env.CHARISMA_AUTH_URL || "https://apig-is.charisma.tech/oauth2/token";
const CHARISMA_CLIENT_ID =
  process.env.CHARISMA_CLIENT_ID || "IpcnOtc6VbA_uXFJXFjlbhOu2fsa";
const CHARISMA_CLIENT_SECRET =
  process.env.CHARISMA_CLIENT_SECRET || "iHfFoimuQab6Nym9BR5c5AEcYkoa";
const CHARISMA_SCOPE = process.env.CHARISMA_SCOPE || "chr_marketing";

// Create HTTPS agent with rejectUnauthorized disabled
const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // Match Python's verify=False
});

// Token cache
let cachedToken = null;
let tokenExpiresAt = null;

/**
 * Get OAuth2 token from Charisma
 * Equivalent to Python's get_token() method
 * @returns {Promise<string>} - Bearer token
 */
async function getToken() {
  try {
    // Check if cached token is still valid
    if (cachedToken && tokenExpiresAt && Date.now() < tokenExpiresAt) {
      console.log("Using cached Charisma token");
      return cachedToken;
    }

    console.log("Fetching new Charisma token...");

    // Create Basic Auth header
    const auth = `${CHARISMA_CLIENT_ID}:${CHARISMA_CLIENT_SECRET}`;
    const encodedAuth = Buffer.from(auth).toString("base64");

    const headers = {
      Authorization: `Basic ${encodedAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    };

    const data = {
      grant_type: "client_credentials",
      scope: CHARISMA_SCOPE,
    };

    // Make request to get token
    const response = await axios.post(CHARISMA_AUTH_URL, data, {
      headers: headers,
      httpsAgent: httpsAgent,
    });

    const result = response.data;
    const token = result.access_token;

    // Cache token with expiration time
    // Assume token expires in 3600 seconds (1 hour), refresh after 55 minutes
    cachedToken = token;
    tokenExpiresAt = Date.now() + (result.expires_in || 3600) * 1000 * 0.95;

    console.log("Successfully obtained Charisma token");
    return token;
  } catch (error) {
    console.error("Error getting Charisma token:", error.message);
    throw new Error(`Failed to get Charisma token: ${error.message}`);
  }
}

/**
 * Create axios instance with Bearer token authentication
 * Equivalent to Python's BearerAuth class
 * @returns {Promise<AxiosInstance>} - Axios instance with Bearer auth
 */
async function createCharismaClient() {
  try {
    const token = await getToken();

    return axios.create({
      baseURL:
        process.env.CHARISMA_API_URL ||
        "https://apig-gw.charisma.tech/gam/v1.0",
      headers: {
        Authorization: `Basic ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 10000,
      httpsAgent: httpsAgent,
    });
  } catch (error) {
    console.error("Error creating Charisma client:", error.message);
    throw error;
  }
}

/**
 * Refresh token manually
 * Useful for forcing a new token
 * @returns {Promise<string>} - New bearer token
 */
async function refreshToken() {
  try {
    console.log("Refreshing Charisma token...");
    cachedToken = null;
    tokenExpiresAt = null;
    return await getToken();
  } catch (error) {
    console.error("Error refreshing token:", error.message);
    throw error;
  }
}

/**
 * Get current cached token (without making a request)
 * @returns {string|null} - Cached token or null
 */
function getCachedToken() {
  if (cachedToken && tokenExpiresAt && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }
  return null;
}

module.exports = {
  getToken,
  createCharismaClient,
  refreshToken,
  getCachedToken,
};
