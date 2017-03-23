'use strict';

const Contract = require('../models/contract');
const web3 = require('../helpers/web3');
const optimusService = require('./optimusService');
const errors = require('../helpers/errors');
const logger = require('../helpers/logger');

/**
 * desc
 * @param  {[type]} address [description]
 * @return [type]           [description]
 */
async function lookupContract(address) {
  const blockNumber = await web3.eth.getBlockNumberAsync();

  const dbPromise = Contract.findOne({
    address: address
  }).exec();
  const web3Promise = web3.eth.getCodeAsync(address, blockNumber);

  const [dbResult, web3Result] = await Promise.all([dbPromise, web3Promise]);

  if (dbResult !== null) {
    return {
      contract: dbResult,
      blockNumber: blockNumber
    };
  } else if (web3Result !== null && web3Result !== '0x') {
    const newContract = new Contract({
      address: address,
      code: web3Result
    });
    await newContract.save();
    logger.info({
      at: 'contractService#lookupContract',
      message: 'Saved new contract to db',
      address: address
    });
    return {
      contract: newContract,
      blockNumber: blockNumber
    };
  } else {
    return {
      contract: null,
      blockNumber: blockNumber
    };
  }
}

async function verifySource(contract, source, sourceType, compilerVersion) {
  if (sourceType === 'solidity') {
    const contracts = await optimusService.compileSolidity(source, compilerVersion, true);
    for (const contractName in contracts) {
      const compiledContract = contracts[contractName];
      const compiledRuntimeBytecode = compiledContract.runtimeBytecode;
      const existingRuntimeCode = contract.code.replace('0x', '');

      const strippedCompiled = removeMetadata(compiledRuntimeBytecode);
      const strippedExisting = removeMetadata(existingRuntimeCode);

      if (strippedCompiled.length === strippedExisting.length) {
        const linkResult = autoLinkLibraries(strippedCompiled, strippedExisting);
        const linkedCompiled = linkResult.linked;
        if (compiledRuntimeBytecode === existingRuntimeCode ||
          linkedCompiled === strippedExisting) {
          logger.info({
            at: 'contractService#verifySource',
            message: 'Found matching source code for contract',
            address: contract.address
          });
          return {
            contractName: contractName,
            libraries: linkResult.libraries,
            abi: JSON.parse(contracts[contractName].interface)
          };
        }
      }
    }
    throw new errors.ClientError(
      "Source did not match contract bytecode",
      errors.errorCodes.sourceMismatch
    );
  } else if (request.body.type === 'serpent') {
    // TODO
    throw new Error('Serpent not yet supported');
  } else {
    throw new Error('Invalid sourceType');
  }
}

// Some solidity contract bytecodes include a swarm hash at the end which seems to not
// be deterministic. For now allow it to be ignored
function removeMetadata(bytecode) {
  return bytecode.replace(/a165627a7a72305820([0-9a-f]{64})0029$/, '');
}

/**
 * Function to automatically find and link libraries in bytecode returned by the compiler
 * Note: if solidity changes how it compiles this may not always work...
 */
function autoLinkLibraries(compiledBytecode, existingBytecode) {
  console.log("ALL");
  let compiledCurrent = compiledBytecode;
  let existingCurrent = existingBytecode;
  let result = "";
  let libraries = {};

  console.log(compiledCurrent);
  let index = compiledCurrent.search(/__[a-zA-Z0-9_]{36}__/);
  while (index !== -1) {
    const address = existingCurrent.slice(index, index + 40);
    const libraryName = compiledCurrent.slice(index, index + 40);

    if (web3.isAddress('0x' + address)) {
      if (libraries.hasOwnProperty(libraryName)) {
        if (libraries[libraryName] !== address) {
          return compiledBytecode;
        }
      } else {
        libraries[libraryName] = address
      }

      result = result + compiledCurrent.slice(0, index);
      result = result + address;
      compiledCurrent = compiledCurrent.slice(index + 40);
      existingCurrent = existingCurrent.slice(index + 40);
      index = compiledCurrent.search(/__[a-zA-Z0-9_]{36}__/);
    } else {
      return compiledBytecode;
    }
  }

  return {
    linked: result + compiledCurrent,
    libraries: libraries
  };
}

module.exports.lookupContract = lookupContract;
module.exports.verifySource = verifySource;
