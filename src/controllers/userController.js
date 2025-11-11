/**
 * userController.js
 * Handles user-related operations such as displaying the home page,
 * playing a game, submitting score, etc.
 */

const CryptoJS = require("crypto-js");
const User = require("../models/user");

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

    // Load friend list with their profiles
    const friends = await User.find({
      _id: { $in: user.friendList },
      deleted: false,
    })
      .select("fullname phone profile.score")
      .limit(20)
      .lean();

    res.locals.user = user;
    res.locals.profile = user.profile || {};
    res.locals.friends = friends || [];
    res.locals.domainURL = process.env.CAMPAIGN_URL;
    res.locals.csrfToken = req.csrfToken();

    return res.render("campaign/home", (err, html) => res.send(html));
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

    // Load friend list with their profiles
    const friends = await User.find({
      _id: { $in: user.friendList },
      deleted: false,
    })
      .select("fullname phone profile.score")
      .limit(20)
      .lean();

    res.locals.user = user;
    res.locals.profile = user.profile || {};
    res.locals.friends = friends || [];
    res.locals.domainURL = process.env.CAMPAIGN_URL;
    res.locals.csrfToken = req.csrfToken();

    return res.render("campaign/game", (err, html) => res.send(html));
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

    if (score >= 200) score = 200;
    req.user.profile.score += Number(score);
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
      req.user.profile.heal += 2;
      req.user.profile.instagramHeal = true;
    } else if (type === "telegram") {
      if (req.user.profile.telegramHeal)
        return res.json({ status: 400, message: "شما قبلا دریافت کرده‌اید!" });
      req.user.profile.heal += 2;
      req.user.profile.telegramHeal = true;
    } else if (type === "twitter") {
      if (req.user.profile.twitterHeal)
        return res.json({ status: 400, message: "شما قبلا دریافت کرده‌اید!" });
      req.user.profile.heal += 2;
      req.user.profile.twitterHeal = true;
    } else if (type === "linkedin") {
      if (req.user.profile.linkedinHeal)
        return res.json({ status: 400, message: "شما قبلا دریافت کرده‌اید!" });
      req.user.profile.heal += 2;
      req.user.profile.linkedinHeal = true;
    } else if (type === "app") {
      if (req.user.profile.appHeal)
        return res.json({ status: 400, message: "شما قبلا دریافت کرده‌اید!" });
      req.user.profile.heal += 2;
      req.user.profile.appHeal = true;
    }

    await req.user.save();

    return res.json({ status: 200 });
  } catch (e) {
    console.error(e);
    res.locals.error = "Failed. server error!";
    return res.json({ status: 500, message: "server error" });
  }
};
