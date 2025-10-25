const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const smsRoutes = require("./smsRoutes");
const userRoutes = require("./userRoutes");

/**
 * GET /
 * Redirects to login or home page
 */
router.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/home");
  } else {
    return res.redirect("/login");
  }
});

/**
 * Combine sub-route modules
 * Each module handles its own path definitions
 */
router.use("/", authRoutes);
router.use("/", userRoutes);

module.exports = router;
