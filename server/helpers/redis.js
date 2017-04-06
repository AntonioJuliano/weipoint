const redis = require("redis");
const bluebird = require('bluebird');
const client = redis.createClient({
  host: process.env.REDIS_URL,
  port: process.env.REDIS_PORT
});

bluebird.promisifyAll(client);

module.exports = client;
