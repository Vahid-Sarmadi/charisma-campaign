const { createLogger, format, transports } = require('winston');

const { combine, timestamp, colorize, printf } = format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    colorize(),
    logFormat
  ),
  transports: [
    new transports.Console(),
    // Uncomment to log to a file:
    // new transports.File({ filename: 'logs/app.log', level: 'info' })
  ],
});

module.exports = logger;
