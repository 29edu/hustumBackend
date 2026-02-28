/**
 * Request logger middleware
 * Logs all incoming requests with method, URL, and timestamp
 */
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
};

module.exports = requestLogger;
