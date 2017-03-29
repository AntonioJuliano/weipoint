const Contract = require('../models/contract');
const web3 = require('../helpers/web3');
const optimusService = require('./optimusService');
const errors = require('../helpers/errors');
const logger = require('../helpers/logger');
const Promise = require('bluebird');

/**
 * Lookup a contract by address on the blockchain. Will query both db
 * and web3. If the contract is found in db, always return that first. If
 * the contract is found on blockchain, but not in db, first save it to db and
 * then return
 *
 * @param  {string}     address address of contract
 * @return {Contract}   the contract
 */
async function lookupContract(address) {
  const dbResult = await Contract.findOne({
    address: address
  }).exec();
  if (dbResult !== null) {
    return dbResult;
  }

  const web3Result = await web3.eth.getCodeAsync(address);
  if (web3Result !== null && web3Result !== '0x') {
    const newContract = new Contract({
      address: address,
      code: web3Result
    });

    // Don't need to wait for this to finish
    newContract.save().then(function() {
      logger.info({
        at: 'contractService#lookupContract',
        message: 'Saved new contract to db',
        address: address
      });
    }).catch(function(err) {
      logger.error({
        at: 'contractService#lookupContract',
        message: 'saving contract async failed',
        error: err.toString()
      });
    });

    return newContract;
  } else {
    return null;
  }
}

/**
 * Attempts to verify the source code of a contract
 *
 * @param  {Contract} contract      contract to verify source for
 * @param  {string} source          provided source code
 * @param  {string} sourceType      language of the source code
 * @param  {string} compilerVersion version of compiler used to compile
 *                                  source code
 * @return {Object}                 Object containing contract name,
 *                                   libraries used, and abi
 */
async function verifySource(contract, source, sourceType, compilerVersion) {
  if (sourceType === 'solidity') {
    const contracts = await optimusService.compileSolidity(source, compilerVersion, true);
    for (const contractName in contracts) {
      const compiledContract = contracts[contractName];
      const compiledRuntimeBytecode = compiledContract.runtimeBytecode;
      const existingRuntimeCode = contract.code.replace('0x', '');

      const strippedCompiled = _removeMetadata(compiledRuntimeBytecode);
      const strippedExisting = _removeMetadata(existingRuntimeCode);

      if (strippedCompiled.length === strippedExisting.length) {
        const linkResult = _autoLinkLibraries(strippedCompiled, strippedExisting);
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
  } else if (sourceType === 'serpent') {
    // TODO
    throw new Error('Serpent not yet supported');
  } else {
    throw new Error('Invalid sourceType');
  }
}

async function callConstantFunction(contract, functionName, args) {
  const Contract = web3.eth.contract(contract.abi);
  const contractInstance = Contract.at(contract.address);
  Promise.promisifyAll(contractInstance);

  logger.debug({
    at: 'contractService#callConstantFunction',
    message: 'calling constant contract function',
    address: contract.address,
    functionName: functionName,
    args: args
  });

  const func = contractInstance[functionName + 'Async'];
  if (typeof func === 'function') {
    try {
      return await func.apply(null, args);
    } catch (e) {
      logger.error({
        at: 'contractService#callConstantFunction',
        message: 'calling contract threw error',
        err: e.toString()
      });
      throw new errors.ClientError(
        e.toString(),
        errors.errorCodes.contractFunctionThrewError
      );
    }
  } else {
    throw new errors.ClientError(
        'Invalid function name',
        errors.errorCodes.invalidArguments
    );
  }
}

/*
 * Some solidity contract bytecodes include a swarm hash at the end which seems
 * to not be deterministic. For now allow it to be ignored
 */
function _removeMetadata(bytecode) {
  return bytecode.replace(/a165627a7a72305820([0-9a-f]{64})0029$/, '');
}

/*
 * Function to automatically find and link libraries in bytecode returned
 * by the compiler
 * Note: if solidity changes how it compiles this may not always work...
 */
function _autoLinkLibraries(compiledBytecode, existingBytecode) {
  let compiledCurrent = compiledBytecode;
  let existingCurrent = existingBytecode;
  let result = "";
  let libraries = {};

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
module.exports.callConstantFunction = callConstantFunction;
