const solc = require('solc');
const bluebirdPromise = require("bluebird");
const logger = require('./logger');
const fetch = require('node-fetch');

bluebirdPromise.promisifyAll(solc);

let versions = {
    "0.4.9": "soljson-v0.4.9+commit.364da425",
    "0.4.8": "soljson-v0.4.8+commit.60cc1668",
    "0.4.7": "soljson-v0.4.7+commit.822622cf",
    "0.4.6": "soljson-v0.4.6+commit.2dabbdf0",
    "0.4.5": "soljson-v0.4.5+commit.b318366e",
    "0.4.4": "soljson-v0.4.4+commit.4633f3de",
    "0.4.3": "soljson-v0.4.3+commit.2353da71",
    "0.4.2": "soljson-v0.4.2+commit.af6afb04",
    "0.4.1": "soljson-v0.4.1+commit.4fc6fc2c",
    "0.4.0": "soljson-v0.4.0+commit.acd334c9",
    "0.3.6": "soljson-v0.3.6+commit.3fc68da",
    "0.3.5": "soljson-v0.3.5+commit.5f97274",
    "0.3.4": "soljson-v0.3.4+commit.7dab890",
    "0.3.3": "soljson-v0.3.3+commit.4dc1cb1",
    "0.3.2": "soljson-v0.3.2+commit.81ae2a7",
    "0.3.1": "soljson-v0.3.1+commit.c492d9b",
    "0.3.0": "soljson-v0.3.0+commit.11d6736",
    "0.2.2": "soljson-v0.2.2+commit.ef92f56",
    "0.2.1": "soljson-v0.2.1+commit.91a6b35",
    "0.2.0": "soljson-v0.2.0+commit.4dc2445",
    "0.1.7": "soljson-v0.1.7+commit.b4e666c",
    "0.1.6": "soljson-v0.1.6+commit.d41f8b7",
    "0.1.5": "soljson-v0.1.5+commit.23865e3",
    "0.1.4": "soljson-v0.1.4+commit.5f6c3cd",
    "0.1.3": "soljson-v0.1.3+commit.28f561",
    "0.1.2": "soljson-v0.1.2+commit.d0d36e3",
    "0.1.1": "soljson-v0.1.1+commit.6ff4cd6"
  };

const SolcImpl = {
  getVersions() {
    return versions;
    // if (versions !== null) {
    //   return Promise.resolve(versions);
    // }
    //
    // logger.info({
    //   at: 'solc#getVersions',
    //   message: 'versions not found locally. Requesting...'
    // });
    //
    // let tempVersions = null;
    //
    // const path = 'https://ethereum.github.io/solc-bin/bin/list.json';
    //
    // return fetch(path)
    //   .then(function(res) {
    //     return res.json();
    //   }).then(function(json) {
    //     tempVersions = {};
    //     for (const key in json.releases) {
    //       const version = json.releases[key].replace(".js", "").replace("soljson-", "");
    //       tempVersions[key] = version;
    //     }
    //     versions = tempVersions;
    //     return versions;
    //   });
  },
  compile(source, version) {
      return this._compile(source, version, 0);
  },
  compileOptimized(source, version) {
      return this._compile(source, version, 1);
  },
  _compile(source, version, optNum) {
    if (versions[version] === undefined) {
      return Promise.reject(new Error("Invalid version"));
    }
    return Promise.resolve(
      solc.setupMethods(require("../bin/soljson/" + versions[version] + ".js"))
    ).then(function(versionedSolc) {
      bluebirdPromise.promisifyAll(versionedSolc);
      // const compileAsync = bluebirdPromise.promisify(versionedSolc.compile);
      // console.log(compileAsync);
      return versionedSolc.compileAsync(source, optNum);
    }).then(function(result) {
      return {
        compiled: result,
        version: version
      };
    })
  }
}

module.exports = SolcImpl;
