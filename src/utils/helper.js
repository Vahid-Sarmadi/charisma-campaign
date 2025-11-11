const { default: axios } = require("axios");

const numerals = {
  persian: ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"],
  arabic: ["۰", "۱", "۲", "۳", "٤", "٥", "٦", "۷", "۸", "۹"],
};

exports.toNormalNumber = (str) => {
  let num,
    i,
    len = str.length,
    result = "";

  for (i = 0; i < len; i++) {
    num = numerals["persian"].indexOf(str[i]);
    if (num === -1) num = numerals["arabic"].indexOf(str[i]);
    if (num === -1) num = str[i];
    result += num;
  }

  return result;
};

exports.isEmptyObject = (obj) => {
  return !Object.keys(obj).length;
};

exports.sendOtp = async (phone, code) => {
  try {
    if (!phone) return { done: false, error: "شماره موبایل وارد نشده است" };

    const endpoint = process.env.MEDIANA_API_URL;

    const headers = {
      accept: "application/json",
      "X-API-KEY": process.env.MEDIANA_API_KEY,
      "Content-Type": "application/json",
    };

    const data = {
      patternCode: process.env.MEDIANA_PATTERN_CODE,
      recipient: phone,
      otpCode: code,
    };

    const response = await axios.post(endpoint, data, { headers });
    if (response.status !== 200 && response.status !== 201) {
      return { done: false, error: `خطا در ارسال پیامک: ${response.status}` };
    }
    return { done: true };
  } catch (e) {
    console.log(e.response);
    console.error("SendSmsCharismaError:", e.message);
    return { done: false, error: e };
  }
};
