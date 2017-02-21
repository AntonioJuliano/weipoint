const fetch = require('node-fetch');

const compilerServiceUrl = process.env.COMPILER_SERVICE_URL;
const compileSolidityPath = '/api/v1/solidity/compile';
const getSolidityCompilerVersionsPath = '/api/v1/solidity/versions';
const Promise = require('bluebird');
const errors = require('../helpers/errors');

function compileSolidity(source, version, optimized) {
  return fetch(
    compilerServiceUrl + compileSolidityPath,
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: source,
        version: version,
        optimized: optimized
      })
    }
  ).then(function(response) {
    if (response.status !== 200) {
      if (response.status === 400) {
        return Promise.reject(
          new errors.ClientError("Compilation failed", errors.errorCodes.sourceMismatch)
        );
      }
      return Promise.reject(new Error("Unhandled error thrown by compiler"));
    }
    return response.json();
  }).then(function(result) {
    return result.contracts;
  });
}

function getSolidityCompilerVersions() {
  return fetch(
    compilerServiceUrl + getSolidityCompilerVersionsPath
  ).then(function(result) {
    return result.json();
  });
}

module.exports.compileSolidity = compileSolidity;
module.exports.getSolidityCompilerVersions = getSolidityCompilerVersions;
