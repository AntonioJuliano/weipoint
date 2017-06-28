const logger = require('../helpers/logger');

module.exports = function(request, response, next) {
  logger.info({
    at: 'requestLogger#logRequest',
    message: 'Received request',
    url: request.url,
    method: request.method,
    headers: request.headers,
    query: request.query,
    body: request.body
  });
  return next();
};
