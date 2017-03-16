'use strict';

const fetch = require('node-fetch');

const compilerServiceUrl = process.env.OPTIMUS_URL;
const compileSolidityPath = '/api/v1/solidity/compile';
const getSolidityCompilerVersionsPath = '/api/v1/solidity/versions';
const Promise = require('bluebird');
const errors = require('../helpers/errors');

async function compileSolidity(source, version, optimized) {
  const response = await fetch(
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
    );

  if (response.status !== 200) {
    if (response.status === 400) {
      throw new errors.ClientError("Compilation failed", errors.errorCodes.sourceMismatch);
    }
    throw new Error("Unhandled error thrown by compiler");
  }
  const json = await response.json();
  return json.contracts;
}

async function getSolidityCompilerVersions() {
  const response = await fetch(compilerServiceUrl + getSolidityCompilerVersionsPath);
  return await response.json();
}

module.exports.compileSolidity = compileSolidity;
module.exports.getSolidityCompilerVersions = getSolidityCompilerVersions;
