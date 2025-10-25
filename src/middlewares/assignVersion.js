/**
 * assignVersion.js
 * Middleware to assign version to response.
 */
module.exports = (req, res, next) => {
  res.locals.version = process.env.VERSION;
  return next();
};
