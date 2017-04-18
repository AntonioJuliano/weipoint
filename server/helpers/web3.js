const Web3 = require("web3");
const web3 = new Web3();
const Promise = require('bluebird');
const logger = require('./logger');
const providerPath = process.env.PARITY_URL;
logger.info({
  at: 'web3#connect',
  message: 'Connecting to web3 provider',
  url: providerPath
});
web3.setProvider(new web3.providers.HttpProvider(providerPath));
Promise.promisifyAll(web3.eth);
Promise.promisifyAll(web3.eth.compile);

function healthCheck() {
  if(!web3.isConnected()) {
    logger.error({
      at: 'web3#healthCheck',
      message: 'not connected to web3 provider'
    });
  }

  setTimeout(healthCheck, 10000);
}

healthCheck();

module.exports = web3;
