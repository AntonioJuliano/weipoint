/**
 * Created by antonio on 1/17/17.
 */
const mongoose = require('mongoose');
const logger = require('./logger');

const mongoUrl = process.env.MONGO_URL;
mongoose.Promise = global.Promise;

const connectWithRetry = function() {
  return mongoose.connect(mongoUrl)
    .then(function(result) {
      logger.info({
        at: 'db#connectWithRetry',
        message: 'Connected to mongo'
      })
    })
    .catch(function(err) {
      if (err) {
        logger.error({
          at: 'db#connectWithRetry',
          message: 'Failed to connect to mongo on startup - retrying in 1 sec',
          error: err
        });
        setTimeout(connectWithRetry, 1000);
      }
    });
};
connectWithRetry();

module.exports = mongoose;
