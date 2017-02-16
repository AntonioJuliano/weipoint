const solc = require('solc');
const bluebirdPromise = require("bluebird");
const logger = require('./logger');
const fetch = require('node-fetch');
const safeEval = require('safe-eval');

bluebirdPromise.promisifyAll(solc);

let versions = {};

let versionedSolcs = {};

const setup = function() {
  const path = 'https://ethereum.github.io/solc-bin/bin';
  const listName = '/list.json';

  logger.info({
    at: 'solc#setup',
    message: 'Loading soljson versions...',
    path: path + listName
  });

  // TODO host these locally
  return fetch(path + listName)
    .then(function(res) {
      return res.json();
    }).then(function(json) {
      tempVersions = {};
      for (const key in json.releases) {
        const version = json.releases[key];
        tempVersions[key] = version;
      }
      logger.info({
        at: 'solc#setup',
        message: 'Fetched soljson version list',
        versions: tempVersions
      });
      versions = tempVersions;

      let promises = [];
      for (version in versions) {
        promises.push(fetch(path + "/" + versions[version]));
      }
      return Promise.all(promises);
    }).then(function(results) {
      logger.info({
        at: 'solc#setup',
        message: 'Fetched solc versions',
      });
      let promises = [];
      for (let i = 0; i < results.length; i++) {
        console.log(results[i]);
        console.log(results[i].json());
        const jsRes = safeEval(results[i]);
        promises.push(solc.setupMethodsAsync(jsRes));
      }
      return Promise.all(promises);
    }).then(function(results) {
      const keys = versions.keys();
      let i = 0;
      for (r in results) {
        versionedSolcs[keys[i++]] = r;
      }
    }).catch(function(err) {
      console.error(err);
      logger.error({
        at: 'solc#setup',
        message: 'Failed to setup solc versions',
        error: err
      })
    });
}

setup();

class SolcImpl {
  getVersions() {
    return versions;
  }

  compile(source, version) {
      return this._compile(source, version, 0);
  }

  compileOptimized(source, version) {
      return this._compile(source, version, 1);
  }

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
