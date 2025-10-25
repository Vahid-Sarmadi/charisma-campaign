/**
 * ensureAuth.js
 * Middleware to ensure the user is logged in.
 */
module.exports = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/login');
};
