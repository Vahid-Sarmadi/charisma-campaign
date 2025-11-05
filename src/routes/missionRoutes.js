/**
 * missionRoutes.js
 * Routes for mission-related endpoints
 */

const express = require("express");
const router = express.Router();
const missionController = require("../controllers/missionController");
const ensureAuth = require("../middlewares/ensureAuth");
const multer = require("multer");

const upload = multer();
const cpUpload = upload.fields([]);

/**
 * GET /missions/status
 * Get current mission status for the authenticated user
 */
router.get("/missions/status", ensureAuth, missionController.getMissionStatus);

/**
 * POST /missions/check/:missionKey
 * Check if a specific mission is completed and update user profile
 * @param {string} missionKey - The mission key (e.g., 'registerHeal', 'tarhHeal', etc.)
 */
router.post(
  "/missions/check/:missionKey",
  ensureAuth,
  cpUpload,
  missionController.checkMission
);

/**
 * POST /missions/check-all
 * Check all missions for the user and update profile
 */
router.post(
  "/missions/check-all",
  ensureAuth,
  cpUpload,
  missionController.checkAllMissions
);

/**
 * POST /missions/manual-complete/:missionKey
 * Manually mark a mission as completed (for testing/admin purposes)
 * @param {string} missionKey - The mission key
 */
router.post(
  "/missions/manual-complete/:missionKey",
  ensureAuth,
  cpUpload,
  missionController.manualCompleteMission
);

module.exports = router;

