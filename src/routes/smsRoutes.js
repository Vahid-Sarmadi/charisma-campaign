const express = require("express");
const multer = require("multer");
const csrf = require("csurf");
const router = express.Router();
const smsController = require("../controllers/smsController");
const authController = require("../controllers/authController");
const {
  smsCodeRateLimit,
  verifyCodeRateLimit,
} = require("../middlewares/phoneRateLimit");

const upload = multer();
const cpUpload = upload.fields([]);
const csrfProtection = csrf({ cookie: true });

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
  verifyCodeRateLimit,
  smsController.verifyCode,
  authController.loginWithPhone
);

module.exports = router;
