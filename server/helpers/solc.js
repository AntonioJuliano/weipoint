const solc = require('solc');
const bluebirdPromise = require("bluebird");
const logger = require('./logger');
const fetch = require('node-fetch');

bluebirdPromise.promisifyAll(solc);

let versions = null;

const SolcImpl = {
  getVersions() {
    if (versions !== null) {
      return Promise.resolve(versions);
    }

    logger.info({
      at: 'solc#getVersions',
      message: 'versions not found locally. Requesting...'
    });

    let tempVersions = null;

    const path = 'https://ethereum.github.io/solc-bin/bin/list.json';

    return fetch(path)
      .then(function(res) {
        return res.json();
      }).then(function(json) {
        tempVersions = {};
        let promises = [];
        for (const key in json.releases) {
          const version = json.releases[key].replace(".js", "").replace("soljson-", "");
          tempVersions[key] = version;
          promises.push(solc.loadRemoteVersionAsync(version));
        }
        return Promise.all(promises);
      }).then(function(results) {
        versions = tempVersions;
        logger.info({
          at: 'solc#getVersions',
          message: 'Successfully fetched versions',
          versions: versions
        });
        return versions;
      })
  },
  compile(source, version) {
      return this._compile(source, version, 0);
  },
  compileOptimized(source, version) {
      return this._compile(source, version, 1);
  },
  _compile(source, version, optNum) {
    this.getVersions().then(function(versions) {
      if (version === null) {
        return solc;
      }
      if (versions[version] === null) {
        return Promise.reject(new Error("Invalid version"));
      }
      return solc.useVersion(versions[version]);
    }).then(function(versionedSolc) {
      return versionedSolc.compileAsync(source, optNum);
    }).then(function(result) {
      return {
        compiled: result,
        version: versionedSolc.version
      };
    })
  }
}

module.exports = SolcImpl;
