const ipfsAPI = require('ipfs-api');
const bluebird = require('bluebird');

const ipfs = ipfsAPI({
  host: process.env.IPFS_URL,
  port: process.env.IPFS_PORT,
  protocol: 'http'
});

bluebird.promisifyAll(ipfs);
bluebird.promisifyAll(ipfs.files);

module.exports = ipfs;
