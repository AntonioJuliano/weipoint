/* eslint no-console: 0 */

const errors = require('./errors');
const logger = require('./logger');
const bugsnag = require('./bugsnag');

function handle(error, response) {
  if (error instanceof errors.ClientError) {
    logger.info({
      at: 'errorHandler#handle',
      message: 'ClientError thrown',
      errorMessage: error.message,
      errorCode: error.code
    });
    response.status(400).json({
      message: error.message,
      code: error.code
    });
  } else if (error instanceof errors.RequestError) {
    logger.info({
      at: 'errorHandler#handle',
      message: 'RequestError thrown',
      validationErrors: error.errors
    });
    response.status(400).json({
      errors: error.errors,
      code: errors.errorCodes.invalidArguments
    });
  } else {
    if (process.env.NODE_ENV === 'development') {
      console.log(error);
    }
    logger.error({
      at: 'errorHandler#handle',
      message: 'unhandled Error thrown',
      error: error
    });
    bugsnag.notify(error);
    response.status(500).json({
      error: 'Server Error'
    });
  }
}

module.exports.handle = handle;
