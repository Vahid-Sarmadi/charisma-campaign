/**
 * phoneRateLimit.js
 * Rate limiting middleware based on phone number
 * Prevents abuse by limiting requests per phone number
 */

const Sms = require("../models/sms");

/**
 * Rate limit for sending SMS codes
 * Allows 3 requests per phone number per hour
 */
exports.smsCodeRateLimit = async (req, res, next) => {
  try {
    const phone = req.body?.phone;

    if (!phone) {
      return next();
    }

    // Check SMS requests in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const recentSmsCount = await Sms.countDocuments({
      phone: phone,
      createdAt: { $gte: oneHourAgo },
    });

    if (recentSmsCount >= 10) {
      return res.json({
        status: 429,
        message: "شما بیش از حد مجاز درخواست کرده‌اید. لطفا 1 ساعت دیگر تلاش کنید.",
        retryAfter: 3600,
      });
    }

    next();
  } catch (error) {
    console.error("Error in smsCodeRateLimit:", error);
    next();
  }
};

/**
 * Rate limit for verifying codes
 * Allows 5 attempts per phone number per 15 minutes
 */
exports.verifyCodeRateLimit = async (req, res, next) => {
  try {
    const phone = req.body?.phone;

    if (!phone) {
      return next();
    }

    // Check verification attempts in the last 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    const attemptCount = await Sms.countDocuments({
      phone: phone,
      createdAt: { $gte: fifteenMinutesAgo },
    });

    if (attemptCount >= 5) {
      return res.json({
        status: 429,
        message: "تعداد تلاش‌های زیاد است. لطفا 15 دقیقه دیگر تلاش کنید.",
        retryAfter: 900,
      });
    }

    next();
  } catch (error) {
    console.error("Error in verifyCodeRateLimit:", error);
    next();
  }
};

