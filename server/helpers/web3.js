const Web3 = require("web3");
const web3 = new Web3();
const bluebirdPromise = require("bluebird");
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
bluebirdPromise.promisifyAll(web3.eth);

module.exports = web3;