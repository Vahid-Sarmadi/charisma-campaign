/**
 * missionController.js
 * Handles mission-related requests and updates user profile based on mission completion
 */

const missionService = require("../services/missionService");
const User = require("../models/user");

/**
 * POST /missions/check/:missionKey
 * Check if a specific mission is completed and update user profile if needed
 */
exports.checkMission = async (req, res) => {
  try {
    const { missionKey } = req.params;
    const user = req.user;

    if (!user) {
      return res.json({ status: 401, message: "Unauthorized" });
    }

    // Check if mission is already completed
    if (user.profile[missionKey]) {
      return res.json({
        status: 200,
        message: "Mission already completed",
        completed: true,
        missionKey: missionKey,
      });
    }

    // Get mission details
    const mission = missionService.getMissionDetails(missionKey);
    if (!mission) {
      return res.json({ status: 400, message: "Invalid mission" });
    }

    // Check mission completion with Charisma API
    const isCompleted = await missionService.checkMissionCompletion(
      missionKey,
      user.phone
    );

    if (isCompleted) {
      // Update user profile
      user.profile[missionKey] = true;
      user.profile.heal += mission.heal;

      // Cap heal at maxHeal
      const Campaign = require("../config/campaign");
      if (user.profile.heal > Campaign.profiles.maxHeal) {
        user.profile.heal = Campaign.profiles.maxHeal;
      }

      await user.save();

      return res.json({
        status: 200,
        message: "Mission completed successfully",
        completed: true,
        missionKey: missionKey,
        healAdded: mission.heal,
        totalHeal: user.profile.heal,
      });
    } else {
      return res.json({
        status: 200,
        message: "Mission not yet completed",
        completed: false,
        missionKey: missionKey,
      });
    }
  } catch (error) {
    console.error("Error in checkMission:", error);
    return res.json({
      status: 500,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * POST /missions/check-all
 * Check all missions for the user and update profile
 */
exports.checkAllMissions = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.json({ status: 401, message: "Unauthorized" });
    }

    // Check all missions with Charisma API
    const missionResults = await missionService.checkAllMissions(user.phone);

    let totalHealAdded = 0;
    const completedMissions = [];

    // Process each mission result
    for (const [missionKey, result] of Object.entries(missionResults)) {
      // Skip if already completed or if there was an error
      if (user.profile[missionKey] || !result.completed) {
        continue;
      }

      // Mark mission as completed
      user.profile[missionKey] = true;
      const mission = missionService.getMissionDetails(missionKey);
      const healAdded = mission.heal;
      user.profile.heal += healAdded;
      totalHealAdded += healAdded;
      completedMissions.push({
        missionKey: missionKey,
        name: mission.name,
        healAdded: healAdded,
      });
    }

    // Cap heal at maxHeal
    const Campaign = require("../config/campaign");
    if (user.profile.heal > Campaign.profiles.maxHeal) {
      user.profile.heal = Campaign.profiles.maxHeal;
    }

    // Save user if any missions were completed
    if (completedMissions.length > 0) {
      await user.save();
    }

    return res.json({
      status: 200,
      message: "Mission check completed",
      completedMissions: completedMissions,
      totalHealAdded: totalHealAdded,
      totalHeal: user.profile.heal,
      allResults: missionResults,
    });
  } catch (error) {
    console.error("Error in checkAllMissions:", error);
    return res.json({
      status: 500,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * GET /missions/status
 * Get current mission status for the user
 */
exports.getMissionStatus = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.json({ status: 401, message: "Unauthorized" });
    }

    const missions = missionService.getAllMissions();
    const status = {};

    for (const [key, mission] of Object.entries(missions)) {
      status[key] = {
        name: mission.name,
        description: mission.description,
        heal: mission.heal,
        completed: user.profile[key] || false,
      };
    }

    return res.json({
      status: 200,
      missions: status,
      totalHeal: user.profile.heal,
    });
  } catch (error) {
    console.error("Error in getMissionStatus:", error);
    return res.json({
      status: 500,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * POST /missions/manual-complete/:missionKey
 * Manually mark a mission as completed (for testing/admin purposes)
 */
exports.manualCompleteMission = async (req, res) => {
  try {
    const { missionKey } = req.params;
    const user = req.user;

    if (!user) {
      return res.json({ status: 401, message: "Unauthorized" });
    }

    const mission = missionService.getMissionDetails(missionKey);
    if (!mission) {
      return res.json({ status: 400, message: "Invalid mission" });
    }

    if (user.profile[missionKey]) {
      return res.json({
        status: 200,
        message: "Mission already completed",
      });
    }

    user.profile[missionKey] = true;
    user.profile.heal += mission.heal;

    const Campaign = require("../config/campaign");
    if (user.profile.heal > Campaign.profiles.maxHeal) {
      user.profile.heal = Campaign.profiles.maxHeal;
    }

    await user.save();

    return res.json({
      status: 200,
      message: "Mission marked as completed",
      missionKey: missionKey,
      healAdded: mission.heal,
      totalHeal: user.profile.heal,
    });
  } catch (error) {
    console.error("Error in manualCompleteMission:", error);
    return res.json({
      status: 500,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = exports;

