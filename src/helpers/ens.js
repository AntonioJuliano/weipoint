const ENS = require('ethereum-ens');
const web3 = require('./web3');

const ens = new ENS(web3);

module.exports = ens;
