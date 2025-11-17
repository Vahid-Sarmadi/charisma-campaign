const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const smsController = require("../controllers/smsController");
const userController = require("../controllers/userController");
const csrf = require("csurf");
const csrfProtection = csrf({ cookie: true });
const multer = require("multer");
const upload = multer();
const cpUpload = upload.fields([]);
const {
  smsCodeRateLimit,
  verifyCodeRateLimit,
} = require("../middlewares/phoneRateLimit");

/**
 * GET /login
 * Shows the user's login page.
 */
router.get("/login", csrfProtection, userController.getLoginPage);

/**
 * POST /sendSmsCode
 * 1) Accepts phone number in req.body
 * 2) Generates OTP code, saves it, and (theoretically) sends an SMS
 */
router.post(
  "/sendSmsCode",
  cpUpload,
  csrfProtection,
  smsCodeRateLimit,
  smsController.sendSmsCode
);

/**
 * POST /verifyCode
 * 1) Checks if submitted code is valid for the given phone
 * 2) If valid, calls passport authentication (phone-login strategy)
 * 3) On success, redirects to /home, otherwise /login
 */
router.post(
  "/verifyCode",
  cpUpload,
  csrfProtection,
  // verifyCodeRateLimit,
  smsController.verifyCode,
  authController.loginWithPhone
);

/**
 * GET /logout
 * Logs out user and redirects to landing
 */
router.get("/logout", authController.logout);

module.exports = router;
