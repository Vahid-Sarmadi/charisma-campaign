const axios = require("axios");
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

exports.sendSms = async (text, phone) => {
  try {
    if (!phone || !text)
      return { done: false, error: "شماره موبایل یا متن پیامک وارد نشده است" };

    let url = `https://hypersmsc.ir/api/json/sendgroupget?username=adrogame&password=${encodeURIComponent("adrogame@123#")}&api=39&from=200032217400&to=${phone}&text=${encodeURIComponent(text)}`;

    const response = await axios({
      method: "GET",
      url: url,
      headers: {
        "Content-Type": "application/text; charset=utf-8",
      },
    });

    if (response.statusText !== "OK") {
      return { done: false, error: "خطا در ارسال کد تایید!" };
    }
    return { done: true };
  } catch (e) {
    console.error("SendSmsError:", e.message);
    return { done: false, error: e };
  }
};
