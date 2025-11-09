const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const smsRoutes = require("./smsRoutes");
const userRoutes = require("./userRoutes");
const missionRoutes = require("./missionRoutes");

/**
 * GET /
 * Redirects to login or home page
 */
router.get("/", (req, res) => {
  const queryString =
    Object.keys(req.query).length > 0
      ? "?" + new URLSearchParams(req.query).toString()
      : "";
  if (req.isAuthenticated()) {
    return res.redirect("/home" + queryString);
  } else {
    return res.redirect("/login" + queryString);
  }
});

/**
 * Combine sub-route modules
 * Each module handles its own path definitions
 */
router.use("/", authRoutes);
router.use("/", userRoutes);
router.use("/", missionRoutes);

module.exports = router;
