/**
 * missionService.js
 * Handles API calls to Charisma backend to verify mission completion
 * Uses OAuth2 Bearer token authentication
 */

// const charismaAuthService = require("./charismaAuthService");
const { BearerAuth } = require("../services/charismaAuthService");

/**
 * Mission definitions with their corresponding API endpoints and heal rewards
 */
const MISSIONS = {
  registerHeal: {
    name: "ثبت نام در کاریزما",
    endpoint: "/is-registred",
    heal: 3,
    description: "ثبت نام در کاریزما",
  },
  tarhHeal: {
    name: "خرید طرح سرمایه‌گذاری",
    endpoint: "/has-plan-order",
    heal: 5,
    description: "خرید طرح سرمایه‌گذاری",
  },
  sandooghHeal: {
    name: "خرید صندوق سرمایه‌گذاری",
    endpoint: "/has-fund-order",
    heal: 5,
    description: "خرید صندوق سرمایه‌گذاری",
  },
  tabdilHeal: {
    name: "استفاده از امکان تبدیل",
    endpoint: "/has-swap",
    heal: 5,
    description: "استفاده از امکان تبدیل",
  },
  vamHeal: {
    name: "دریافت کاریزما وام",
    endpoint: "/has-loan",
    heal: 5,
    description: "دریافت کاریزما وام",
  },
};

/**
 * Check if a mission is completed by calling Charisma API
 * @param {string} missionKey - The mission key (e.g., 'registerHeal')
 * @param {string} mobileNumber - User's mobile number
 * @returns {Promise<boolean>} - True if mission is completed
 */
exports.checkMissionCompletion = async (missionKey, mobileNumber) => {
  try {
    if (!MISSIONS[missionKey]) {
      throw new Error(`Unknown mission: ${missionKey}`);
    }

    const mission = MISSIONS[missionKey];
    const auth = new BearerAuth();
    const serverUrl = "https://apig-gw.charisma.tech/gam/v1.0";
    const response = await auth.get(serverUrl + mission.endpoint, {
      params: {
        mobileNumber: mobileNumber,
      },
    });

    console.log(response);
    // The API returns a boolean or object with completion status
    // Adjust based on actual API response format
    if (response.status === 200) {
      const data = response.data;
      // Assuming the API returns { completed: true/false } or similar
      return data.completed === true || data.result === true || data === true;
    }

    return false;
  } catch (error) {
    console.error(`Error checking mission ${missionKey}:`, error.message);
    throw error;
  }
};

/**
 * Check all missions for a user
 * @param {string} mobileNumber - User's mobile number
 * @returns {Promise<Object>} - Object with mission completion status
 */
exports.checkAllMissions = async (mobileNumber) => {
  try {
    const client = await charismaAuthService.createCharismaClient();
    const results = {};

    // Define all API endpoints to check
    const endpoints = [
      { key: "registerHeal", endpoint: "/is-registred" },
      { key: "tarhHeal", endpoint: "/has-plan-order" },
      { key: "sandooghHeal", endpoint: "/has-fund-order" },
      { key: "tabdilHeal", endpoint: "/has-swap" },
      { key: "vamHeal", endpoint: "/has-loan" },
    ];

    // Make parallel requests to all endpoints
    const promises = endpoints.map(async (item) => {
      try {
        const response = await client.get(item.endpoint, {
          params: {
            mobileNumber: mobileNumber,
          },
        });

        results[item.key] = {
          completed:
            response.data.completed === true || response.data.result === true,
          status: response.status,
          data: response.data,
        };
      } catch (error) {
        console.error(`Error checking ${item.key}:`, error.message);
        results[item.key] = {
          completed: false,
          error: error.message,
          status: error.response?.status || 500,
        };
      }
    });

    await Promise.all(promises);
    return results;
  } catch (error) {
    console.error("Error checking all missions:", error.message);
    throw error;
  }
};

/**
 * Get mission details
 * @param {string} missionKey - The mission key
 * @returns {Object} - Mission details
 */
exports.getMissionDetails = (missionKey) => {
  return MISSIONS[missionKey] || null;
};

/**
 * Get all missions
 * @returns {Object} - All missions
 */
exports.getAllMissions = () => {
  return MISSIONS;
};

module.exports = exports;
