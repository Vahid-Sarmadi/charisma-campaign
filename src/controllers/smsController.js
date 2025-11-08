/**
 * smsController.js
 * Logic for sending and verifying OTP codes.
 * Assumes a Sms model with a short TTL for the code.
 */

const validator = require("validator");
const axios = require("axios");
const Sms = require("../models/sms");
const {
  toNormalNumber,
  isEmptyObject,
  sendSms,
  sendSmsCharisma,
} = require("../utils/helper");

// A helper function to generate a numeric OTP code of given length
function generateOtpCode(length = 4) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code;
}

/**
 * sendSmsCode:
 * 1) Receives phone from req.body
 * 2) Generates a code
 * 3) Saves to Sms collection
 * 4) (In reality, you'd integrate with Twilio or another SMS API to actually send it)
 */
exports.sendSmsCode = async (req, res) => {
  try {
    let phone = req.body?.phone || "";
    let fullname = req.body?.fullname || "";

    phone = toNormalNumber(phone.trim());
    fullname = fullname.trim();

    let error = {};

    if (!phone) {
      error["phone"] = "شماره موبایل را وارد کنید.";
    } else if (!validator.isMobilePhone(phone, "fa-IR")) {
      error["phone"] = "شماره وارد شده نامعتبر است.";
    }

    if (!fullname) {
      error["fullname"] = "نام خود را وارد کنید.";
    }

    if (!isEmptyObject(error)) {
      return res.json({ status: 501, error: error });
    }

    const code = generateOtpCode(5);

    let sms = new Sms({
      phone: phone,
      code: code,
      // code: "12345",
    });

    const text = "کد ورود شما: " + code + "\n\n کاریزما";
    const { done } = await sendSmsCharisma(text, phone);
    if (!done) {
      return res.json({ status: 502, message: "خطا در ارسال کد تایید!" });
    }

    await sms.save();

    return res.json({ status: 200 });
  } catch (error) {
    console.error("Error in sendSmsCode:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * verifyCode:
 * 1) Validates phone + code from req.body
 * 2) Checks existence in Sms collection
 * 3) If valid (and not expired), store phone/code on req.body for Passport
 * 4) Calls next() to continue to authController.loginWithPhone
 */
exports.verifyCode = async (req, res, next) => {
  try {
    let fullname = req.body.fullname || "";
    let phone = req.body.phone || "";
    let code = req.body.sms || "";

    phone = toNormalNumber(phone.trim());
    code = toNormalNumber(code.trim());
    fullname = fullname.trim();

    console.log(req.body);
    let error = {};

    if (!fullname) {
      error["fullname"] = "نام خود را وارد کنید.";
    }
    if (!phone) {
      error["phone"] = "شماره موبایل را وارد کنید.";
    } else if (!validator.isMobilePhone(phone, "fa-IR")) {
      error["phone"] = "شماره وارد شده نامعتبر است.";
    }

    if (!code) {
      error["sms"] = "کد را وارد کنید.";
    }

    if (!isEmptyObject(error)) {
      return res.json({ status: 501, error: res.locals.error });
    }

    const smsRecord = await Sms.findOne({ phone, code });
    if (!smsRecord) {
      return res.json({ status: 400, message: "کد وارد شده معتبر نمیباشد." });
    }

    // If found, set up for Passport
    req.body.username = phone; // For the 'phone-login' strategy
    req.body.password = code; // For the 'phone-login' strategy

    return next();
  } catch (error) {
    console.error("Error in verifyCode:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
