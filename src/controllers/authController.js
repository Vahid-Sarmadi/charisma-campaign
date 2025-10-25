/**
 * authController.js
 * Manages login page rendering, logout process,
 * and finalizes passport login (in combination with smsController verify).
 */

const passport = require("passport");

exports.loginPage = (req, res) => {
  // Renders login form (phone input & code input).
  // If using flash messages for errors, pass them to the view:
  const message = req.flash("error");
  return res.render("login", { message });
};

/**
 * loginWithPhone:
 * Used after smsController.verifyCode ensures the OTP is valid,
 * then calls passport.authenticate('phone-login').
 */
exports.loginWithPhone = (req, res, next) => {
  passport.authenticate("phone-login", (err, user, info) => {
    if (err) {
      console.error(err);
      return res.json({ status: 500, message: "خطا در سرور!", error: err });
    }
    if (!user) {
      return res.json(info);
    }

    req.session.cookie.maxAge = 60 * 24 * 60 * 60 * 1000;

    req.logIn(user, (err) => {
      if (err) {
        console.error(err);
        return res.json({ status: 500, message: "خطا در سرور!", error: err });
      }

      return res.json({ status: 200, message: "خوش آمدید", user: user });
    });
  })(req, res, next);
};

/**
 * logout:
 * Ends the session and redirects to landing page or login.
 */
exports.logout = (req, res) => {
  // Passport 0.6+ requires callback for req.logout().
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.redirect("/home"); // or an error page
    }
    return res.redirect("/");
  });
};
