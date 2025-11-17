/**
 * phoneRateLimit.js
 * Rate limiting middleware based on phone number + IP
 * Prevents abuse by limiting requests per phone and per IP
 */

const Sms = require("../models/sms");

/**
 * Helper function to get client IP address
 * Handles proxies and X-Forwarded-For headers
 */
function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.headers["x-real-ip"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.ip
  );
}

/**
 * Rate limit for sending SMS codes
 * Conditions:
 * 1. Max 10 requests per phone number per hour
 * 2. Max 50 requests per IP per hour
 * 3. Max 100 different phone numbers per IP per hour (prevents script attacks)
 */
exports.smsCodeRateLimit = async (req, res, next) => {
  try {
    const phone = req.body?.phone;
    const ip = getClientIp(req);

    if (!phone || !ip) {
      return next();
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Check 1: Phone number limit (10 per hour)
    const phoneCount = await Sms.countDocuments({
      phone: phone,
      createdAt: { $gte: oneHourAgo },
    });

    if (phoneCount >= 10) {
      return res.json({
        status: 429,
        message:
          "شما بیش از حد مجاز درخواست کرده‌اید. لطفا 1 ساعت دیگر تلاش کنید.",
        retryAfter: 3600,
      });
    }

    // Check 2: IP limit (50 per hour)
    const ipCount = await Sms.countDocuments({
      ip: ip,
      createdAt: { $gte: oneHourAgo },
    });

    if (ipCount >= 50) {
      return res.json({
        status: 429,
        message:
          "درخواست‌های زیادی از این آدرس IP ارسال شده است. لطفا بعدا تلاش کنید.",
        retryAfter: 3600,
      });
    }

    // Check 3: Different phone numbers per IP (100 per hour)
    const uniquePhones = await Sms.distinct("phone", {
      ip: ip,
      createdAt: { $gte: oneHourAgo },
    });

    if (uniquePhones.length >= 100) {
      return res.json({
        status: 429,
        message: "تعداد شماره‌های مختلف از این آدرس IP بیش از حد است.",
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
 * Conditions:
 * 1. Max 5 attempts per phone number per 15 minutes
 * 2. Max 20 attempts per IP per 15 minutes
 */
exports.verifyCodeRateLimit = async (req, res, next) => {
  try {
    const phone = req.body?.phone;
    const ip = getClientIp(req);

    if (!phone || !ip) {
      return next();
    }

    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    // Check 1: Phone number limit (5 per 15 minutes)
    const phoneAttempts = await Sms.countDocuments({
      phone: phone,
      createdAt: { $gte: fifteenMinutesAgo },
    });

    if (phoneAttempts >= 5) {
      return res.json({
        status: 429,
        message: "تعداد تلاش‌های زیاد است. لطفا 15 دقیقه دیگر تلاش کنید.",
        retryAfter: 900,
      });
    }

    // Check 2: IP limit (20 per 15 minutes)
    const ipAttempts = await Sms.countDocuments({
      ip: ip,
      createdAt: { $gte: fifteenMinutesAgo },
    });

    if (ipAttempts >= 20) {
      return res.json({
        status: 429,
        message: "تعداد تلاش‌های زیادی از این آدرس IP انجام شده است.",
        retryAfter: 900,
      });
    }

    next();
  } catch (error) {
    console.error("Error in verifyCodeRateLimit:", error);
    next();
  }
};
