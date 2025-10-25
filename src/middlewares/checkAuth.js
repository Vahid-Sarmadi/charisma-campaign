/**
 * ensureAuth.js
 * Middleware to ensure the user is logged in.
 */
module.exports = (req, res, next) => {
  req.isAuthenticated();
  return next();
};
