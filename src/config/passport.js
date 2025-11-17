const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user");

const Campaign = require("../config/campaign");
const { sendRefral } = require("../utils/helper");

/**
 * Passport configuration:
 * - Using a 'phone-login' local strategy that treats 'phone' as username
 *   and 'code' as the password.
 * - In real scenarios, you'd verify the code via your SMS model or OTP logic
 *   before finalizing the user login.
 */
passport.use(
  "phone-login",
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password", // We'll treat 'code' as 'password' for the strategy
      passReqToCallback: true, // lets us access req in the callback if needed
    },
    async (req, username, password, done) => {
      try {
        // Typically, you'd verify that 'code' is valid for the given phone.
        // If the code has already been checked by a middleware, you might just log them in:

        // Find or create the user by phone
        let user = await User.findOne({ phone: username, deleted: false });

        if (!user) {
          let nextHeal = new Date();
          nextHeal.setHours(
            nextHeal.getHours() + Number(Campaign.profiles.nextHealTime)
          );

          let newUser = new User({
            phone: username,
            fullname: req.body.fullname,
            nextHeal: nextHeal,
            shareLink: new Date().getTime(),
            profile: {
              heal: Campaign.profiles.startHeal,
              score: Campaign.profiles.startScore,
            },
          });

          let _user = await newUser.save();

          if (req.query.link) {
            //todo: check link is valid
            let __user = await User.findOne({
              shareLink: req.query.link,
              deleted: false,
            }).exec();
            if (__user) {
              __user.profile.heal += Campaign.profiles.shareHeal;
              if (__user.profile.heal > Campaign.profiles.maxHeal)
                __user.profile.heal = Campaign.profiles.maxHeal;
              __user.profile.shares++;
              __user.friendList.push([_user._id]);
              _user.friendList.push([__user._id]);
              await _user.save();
              await __user.save();
              sendRefral(__user.phone);
            }
          }
          return done(null, _user, { status: 200, message: "خوش آمدید." });
        }

        // If code is valid (already validated in a prior step), log them in:
        await user.save();
        return done(null, user, { status: 200, message: "خوش آمدید." });

        // In a real app, if code verification fails, you'd do:
        // return done(null, false, { message: 'Invalid or expired OTP code' });
      } catch (error) {
        return done(error);
      }
    }
  )
);

/**
 * Serialize the user ID to save in the session store.
 */
passport.serializeUser((user, done) => {
  done(null, user.id);
});

/**
 * Deserialize the user from the ID we stored in the session.
 */
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      return done(new Error("user not found"));
    }
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
