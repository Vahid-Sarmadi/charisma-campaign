/**
 * userController.js
 * Handles user-related operations such as displaying the home page,
 * playing a game, submitting score, etc.
 */

const CryptoJS = require("crypto-js");
const User = require("../models/user");
const { sendSms } = require("../utils/helper");
const xlsx = require("node-xlsx");
const path = require("path");

exports.init = async () => {
  try {
    // try {
    //   await Gifts.collection.drop();
    //   await GiftCounters.collection.drop();
    // } catch (e) {return false;}

    let temp = xlsx.parse(path.join(__dirname, "../data", "data.xlsx")); // parses a file

    // Get the headers from the first row
    const headers = temp[0].data[0];

    // Start from index 1 to skip headers
    const usersData = temp[0].data.slice(1);

    // Array to store all user documents
    const usersToInsert = usersData.map((row) => {
      // Create an object mapping headers to values
      const userData = {};
      headers.forEach((header, index) => {
        switch (header) {
          case "ID":
            userData._id = row[index];
            break;
          case "Phone":
            userData.phone = row[index];
            break;
          case "ShareLink":
            userData.shareLink = row[index];
            break;
          case "NextHeal":
            // Convert Excel date (days since 1900) to JavaScript Date
            userData.nextHeal = new Date((row[index] - 25569) * 86400 * 1000);
            break;
          case "FriendList":
            userData.friendList = JSON.parse(row[index] || "[]");
            break;
          case "InviteList":
            userData.inviteList = JSON.parse(row[index] || "[]");
            break;
          case "Role":
            userData.role = row[index];
            break;
          case "Deleted":
            userData.deleted = Boolean(row[index]);
            break;
          case "CreatedAt":
            userData.createdAt = new Date((row[index] - 25569) * 86400 * 1000);
            break;
          case "UpdatedAt":
            userData.updatedAt = new Date((row[index] - 25569) * 86400 * 1000);
            break;
          case "Heal":
            userData.profile = {
              ...userData.profile,
              heal: Number(row[index]),
            };
            break;
          case "Score":
            userData.profile = {
              ...userData.profile,
              score: Number(row[index]),
            };
            break;
          case "Shares":
            userData.profile = {
              ...userData.profile,
              shares: Number(row[index]),
            };
            break;
          case "InstagramHeal":
            userData.profile = {
              ...userData.profile,
              instagramHeal: Boolean(row[index]),
            };
            break;
          case "VideoHeal":
            userData.profile = {
              ...userData.profile,
              videoHeal: Boolean(row[index]),
            };
            break;
          case "GiftLevel":
            userData.profile = {
              ...userData.profile,
              giftLevel: Number(row[index]),
            };
            break;
          case "Sms1Sent":
            userData.profile = {
              ...userData.profile,
              sms1Sent: Boolean(row[index]),
            };
            break;
          case "Sms2Sent":
            userData.profile = {
              ...userData.profile,
              sms2Sent: Boolean(row[index]),
            };
            break;
          case "Sms3Sent":
            userData.profile = {
              ...userData.profile,
              sms3Sent: Boolean(row[index]),
            };
            break;
          case "Sms4Sent":
            userData.profile = {
              ...userData.profile,
              sms4Sent: Boolean(row[index]),
            };
            break;
          case "ReminderSms":
            userData.profile = {
              ...userData.profile,
              reminderSms: Number(row[index]),
            };
            break;
        }
      });

      return userData;
    });

    // Bulk insert all users
    await User.insertMany(usersToInsert, { ordered: false });

    console.log("==================================");
    console.log("Data added successfully...");
    console.log(`Imported ${usersToInsert.length} users`);
    console.log("==================================");
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

/**
 * getLoginPage:
 * Loads the user's information and renders the login page.
 */
exports.getLoginPage = async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      return res.redirect("/home");
    }
    res.locals.user = req.user || {};
    res.locals.domainURL = process.env.CAMPAIGN_URL;
    res.locals.csrfToken = req.csrfToken();

    return res.render("auth/login", (err, html) => res.send(html));
  } catch (error) {
    console.error("Error in getLoginPage:", error);
    return res.render("error", { message: "Unable to load login page" });
  }
};

/**
 * getHome:
 * Loads the logged-in user's information and renders the home page.
 */
exports.getHome = async (req, res) => {
  try {
    const user = req.user; // Provided by Passport session
    if (!user) return res.redirect("/login");

    res.locals.user = user;
    res.locals.profile = user.profile || {};
    res.locals.domainURL = process.env.CAMPAIGN_URL;
    res.locals.csrfToken = req.csrfToken();

    if (res.locals.profile.giftLevel >= 6 && !res.locals.profile.sms3Sent) {
      // const text = 'آفرین!\n' +
      //   'قاب فلزی رو تمیز کردی و یک شانس قرعه‌کشی آیفون ۱۶ بدست آوردی✌️\n' +
      //   '\n' +
      //   '«نتیجه از طریق پیج اینستاگرام کاریزما اعلام خواهد شد»\n' +
      //   'zaya.io/sybdw';
      // sendSms(text, user.phone).then((r) => {
      //   if (r.done) {
      //     res.locals.user.profile.sms3Sent = true;
      //     res.locals.user.save();
      //   }
      // });
    } else if (
      res.locals.profile.giftLevel >= 3 &&
      !res.locals.profile.sms2Sent
    ) {
      // const text = 'آفرین!\n' +
      //   'قاب چوبی رو تمیز کردی و یک شانس قرعه‌کشی پلی‌استیشن‌ بدست آوردی✌️\n' +
      //   '\n' +
      //   '«نتیجه از طریق پیج سیف اعلام خواهد شد»\n' +
      //   'zaya.io/sybdw';
      // sendSms(text, user.phone).then((r) => {
      //   if (r.done) {
      //     res.locals.user.profile.sms2Sent = true;
      //     res.locals.user.save();
      //   }
      // });
    } else if (
      res.locals.profile.giftLevel >= 1 &&
      !res.locals.profile.sms1Sent
    ) {
      // const text = 'آفرین!\n' +
      //   'قاب شیشه‌ای رو تمیز کردی و یک شانس قرعه‌کشی جاروی هوشمند بدست آوردی✌️\n' +
      //   '\n' +
      //   '«نتیجه از طریق پیج سیف اعلام خواهد شد»\n' +
      //   'zaya.io/sybdw';
      // sendSms(text, user.phone).then((r) => {
      //   if (r.done) {
      //     res.locals.user.profile.sms1Sent = true;
      //     res.locals.user.save();
      //   }
      // });
    }

    // Simply render the game template
    return res.render("campaign/home");
  } catch (error) {
    console.error("Error in getHome:", error);
    return res.render("error", { message: "Unable to load home page" });
  }
};

/**
 * getGamePage:
 * Renders a game page where user can play a game and submit a score.
 */
exports.getGamePage = async (req, res) => {
  try {
    const user = req.user; // Provided by Passport session
    if (!user) return res.redirect("/login");

    res.locals.user = user;
    res.locals.profile = user.profile || {};
    res.locals.domainURL = process.env.CAMPAIGN_URL;
    res.locals.csrfToken = req.csrfToken();

    if (res.locals.profile.giftLevel >= 6 && !res.locals.profile.sms3Sent) {
      // const text = 'آفرین!\n' +
      //   'قاب فلزی رو تمیز کردی و یک شانس قرعه‌کشی آیفون ۱۶ بدست آوردی✌️\n' +
      //   '\n' +
      //   '«نتیجه از طریق پیج اینستاگرام کاریزما اعلام خواهد شد»\n' +
      //   'zaya.io/sybdw';
      // sendSms(text, user.phone).then((r) => {
      //   if (r.done) {
      //     res.locals.user.profile.sms3Sent = true;
      //     res.locals.user.save();
      //   }
      // });
    } else if (
      res.locals.profile.giftLevel >= 3 &&
      !res.locals.profile.sms2Sent
    ) {
      // const text = 'آفرین!\n' +
      //   'قاب چوبی رو تمیز کردی و یک شانس قرعه‌کشی پلی‌استیشن‌ بدست آوردی✌️\n' +
      //   '\n' +
      //   '«نتیجه از طریق پیج سیف اعلام خواهد شد»\n' +
      //   'zaya.io/sybdw';
      // sendSms(text, user.phone).then((r) => {
      //   if (r.done) {
      //     res.locals.user.profile.sms2Sent = true;
      //     res.locals.user.save();
      //   }
      // });
    } else if (
      res.locals.profile.giftLevel >= 1 &&
      !res.locals.profile.sms1Sent
    ) {
      // const text = 'آفرین!\n' +
      //   'قاب شیشه‌ای رو تمیز کردی و یک شانس قرعه‌کشی جاروی هوشمند بدست آوردی✌️\n' +
      //   '\n' +
      //   '«نتیجه از طریق پیج سیف اعلام خواهد شد»\n' +
      //   'zaya.io/sybdw';
      // sendSms(text, user.phone).then((r) => {
      //   if (r.done) {
      //     res.locals.user.profile.sms1Sent = true;
      //     res.locals.user.save();
      //   }
      // });
    }

    // Simply render the game template
    return res.render("campaign/game");
  } catch (error) {
    console.error("Error in getGamePage:", error);
    return res.render("error", { message: "Unable to load game page" });
  }
};

/**
 * submitScore:
 * Updates the user's score in the database.
 * Expects `score` in req.body.
 */
exports.submitScore = async (req, res) => {
  try {
    if (!req.params.score || !req.headers.token) {
      return res.json({ status: 401 });
    }
    let payload = decodeURIComponent(req.params.score);
    let score = CryptoJS.AES.decrypt(payload, req.headers.token).toString(
      CryptoJS.enc.Utf8
    );

    req.user.profile.score += Number(score);
    req.user.profile.giftLevel += 1;
    await req.user.save();

    return res.json({ status: 200 });
  } catch (e) {
    console.error(e);
    res.locals.error = "Failed. server error!";
    return res.json({ status: 500, message: "server error" });
  }
};

exports.loseScore = async (req, res) => {
  try {
    if (!req.headers.token) {
      return res.json({ status: 401 });
    }

    req.user.profile.heal--;
    await req.user.save();

    return res.json({ status: 200 });
  } catch (e) {
    console.error(e);
    res.locals.error = "Failed. server error!";
    return res.json({ status: 500, message: "server error" });
  }
};

/**
 * addHeal:
 * Updates the user's heal in the database.
 * Expects `type` in req.body.
 */
exports.addHeal = async (req, res) => {
  try {
    if (!req.params.type || !req.headers.token) {
      return res.json({ status: 401 });
    }
    const type = req.params.type;
    if (type === "instagram") {
      if (req.user.profile.instagramHeal)
        return res.json({ status: 400, message: "شما قبلا دریافت کرده‌اید!" });
      // req.user.profile.heal++;
      req.user.profile.instagramHeal = true;
    } else if (type === "video") {
      if (req.user.profile.videoHeal)
        return res.json({ status: 400, message: "شما قبلا دریافت کرده‌اید!" });
      req.user.profile.heal++;
      req.user.profile.videoHeal = true;
    }

    await req.user.save();

    return res.json({ status: 200 });
  } catch (e) {
    console.error(e);
    res.locals.error = "Failed. server error!";
    return res.json({ status: 500, message: "server error" });
  }
};

/**
 * sendSmsScore:
 * Demonstrates sending an SMS after score submission or any event.
 * In a real implementation, integrate with Twilio/Nexmo, etc.
 */
// exports.sendSmsScore = async (req, res) => {
//   try {
//     const user = req.user;
//     if (!user) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }
//
//     // Example: "Sending SMS with new score to user.phone"
//     console.log(`Sending SMS about new score to phone: ${user.phone}`);
//
//     // In real life, you'd call your SMS service here:
//     // smsService.sendScoreNotification(user.phone, user.profile.score);
//
//     return res.json({ message: "Score SMS sent" });
//   } catch (error) {
//     console.error("Error in sendSmsScore:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

/**
 * gameEnd:
 * Any final logic when the game ends, then redirect to /home.
 */
// exports.gameEnd = (req, res) => {
//   try {
//     // Optionally do some final logic:
//     // e.g., record lastPlayed date, check achievements, etc.
//
//     return res.redirect("/home");
//   } catch (error) {
//     console.error("Error in gameEnd:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };
