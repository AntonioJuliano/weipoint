const winston = require('winston');

winston.emitErrs = true;

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      json: process.env.NODE_ENV === 'production' ? true : false,
      colorize: true
    })
  ],
  exitOnError: false
});

module.exports = logger;
