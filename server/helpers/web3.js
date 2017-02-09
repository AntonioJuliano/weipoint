const Web3 = require("web3");
const web3 = new Web3();
const bluebirdPromise = require("bluebird");
const logger = require('./logger');
const providerPath = process.env.PARITY_URL;
logger.info({
  at: 'web3#connect',
  message: 'Connecting to web3 provider',
  url: providerPath
})
web3.setProvider(new web3.providers.HttpProvider(providerPath));
bluebirdPromise.promisifyAll(web3.eth);
bluebirdPromise.promisifyAll(web3.eth.compile);


module.exports = web3;
