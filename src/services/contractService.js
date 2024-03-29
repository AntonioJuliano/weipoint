const Contract = require('../models/contract');
const web3 = require('../helpers/web3');
const optimusService = require('./optimusService');
const errors = require('../helpers/errors');
const logger = require('../helpers/logger');
const Promise = require('bluebird');
const bugsnag = require('../helpers/bugsnag');

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
  address = address.toLowerCase();
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
      bugsnag.notify(err);
      logger.error({
        at: 'contractService#lookupContract',
        message: 'saving contract async failed',
        error: err.toString()
      });
    });

    return newContract;
  } else {
    throw new errors.ClientError(
      "Contract not found",
      errors.errorCodes.notFound
    );
  }
}

/**
 * Attempts to verify the source code of a contract. Saves the updated contract if
 * verification successful
 *
 * @param  {Contract} contract      contract to verify source for
 * @param  {string} source          provided source code
 * @param  {string} sourceType      language of the source code
 * @param  {string} compilerVersion version of compiler used to compile
 *                                  source code
 * @param  {bool} optimized         Is the source code optimized?
 * @return {Contract}               The contract updated with source info
 */
async function verifySource(contract, source, sourceType, compilerVersion, optimized) {
  if (sourceType === 'solidity') {
    const contracts = await optimusService.compileSolidity(source, compilerVersion, optimized);
    const existingRuntimeCode = contract.code.replace('0x', '');
    const strippedExisting = _removeMetadata(existingRuntimeCode);
    for (const contractName in contracts) {
      const compiledContract = contracts[contractName];
      const compiledRuntimeBytecode = compiledContract.runtimeBytecode;

      const strippedCompiled = _removeMetadata(compiledRuntimeBytecode);

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

          contract.source = source;
          contract.sourceType = sourceType;
          contract.sourceVersion = compilerVersion;
          contract.name = contractName;
          contract.abi = JSON.parse(contracts[contractName].interface);
          contract.libraries = linkResult.libraries;
          contract.isToken = isToken(contract);
          await contract.save();

          return contract;
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

/**
 * Call a constant function on a solidity contract
 * @param  {Contract} contract    the contract to call
 * @param  {string} functionName  name of the function to call
 * @param  {Array} args           list of arguments to pass to the function
 * @return {Object}               value returned by the function
 */
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
      logger.info({
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

/**
 * Gets the balance in ether of the account at an address
 * @param  {string} address address of the account
 * @return {Number} balance in ether of the account
 */
async function getBalance(address) {
  const balance = await web3.eth.getBalanceAsync(address);
  return balance.toNumber() / 1000000000000000000.0;
}

async function addMetadata(contract, metadata) {
  if (metadata.tags) {
    _addTags(contract, metadata.tags);
  }
  if (metadata.description) {
    const descriptionPending = !!contract.description;
    _addDescription(contract, metadata.description, descriptionPending);
  }
  if (metadata.link) {
    _addLink(contract, metadata.link, true);
  }
  if (metadata.name) {
    _addName(contract, metadata.name, true);
  }

  await contract.save();
  return contract;
}

function _addTags(contract, tags) {
  tags.forEach(tag => {
    if (!contract.tags.map( t => t.tag ).includes(tag)) {
      contract.tags.push({
        tag: tag,
        approved: false
      });
    }
  });
  if (contract.tags.length > Contract.MAX_TAGS) {
    throw new errors.ClientError(
        'Too many tags',
        errors.errorCodes.tooManyTags
    );
  }
  return contract;
}

function _addDescription(contract, description, pending) {
  if (pending &&
      !contract.pendingDescriptions.includes(description)
      && contract.description !== description) {
    contract.pendingDescriptions.push(description);
  } else if (!pending) {
    contract.description = description;
  }
  return contract;
}

function _addLink(contract, link, pending) {
  if (pending &&
      !contract.pendingLinks.includes(link)
      && contract.link !== link) {
    contract.pendingLinks.push(link);
  }
  if (!pending) {
    contract.link = link;
  }
  return contract;
}

function _addName(contract, name, pending) {
  if (pending &&
      !contract.pendingNames.includes(name)
      && contract.name !== name) {
    contract.pendingNames.push(name);
  }
  if (!pending) {
    contract.name = name;
  }
  return contract;
}

function toJson(contract) {
  let json = {
    name: contract.name,
    address: contract.address,
    code: contract.code,
    source: contract.source,
    sourceType: contract.sourceType,
    sourceVersion: contract.sourceVersion,
    optimized: contract.optimized,
    abi: contract.abi,
    tags: contract.tags.map(_tagToJson),
    libraries: contract.libraries,
    description: contract.description,
    link: contract.link,
    score: contract.score.value,
    isToken: contract.isToken,
    creator: contract.creator
  };

  if (contract.type) {
    json.type = contract.type;
  }

  return json;
}

function _tagToJson(tag) {
  return {
    tag: tag.tag,
    approved: tag.approved
  };
}

/*
 * Some solidity contract bytecodes include a swarm hash (sometimes more than one) which seems
 * to not be deterministic. For now allow it to be ignored
 */
function _removeMetadata(bytecode) {
  return bytecode.replace(/a165627a7a72305820([0-9a-f]{64})0029/g, '');
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

function isToken(contract) {
  if (contract.abi) {
    const balanceOf = contract.abi.filter( f => f.name === 'balanceOf' )[0];
    const decimals = contract.abi.filter( f => f.name === 'decimals' )[0];
    const symbol = contract.abi.filter( f => f.name === 'symbol' )[0];
    const transfer = contract.abi.filter( f => f.name === 'transfer' )[0];

    if (balanceOf
        && decimals
        && symbol
        && symbol.inputs.length === 0
        && symbol.constant
        && symbol.outputs.length === 1
        && symbol.outputs[0].type === 'string'
        && decimals.constant
        && decimals.inputs.length === 0
        && decimals.outputs.length === 1
        && decimals.outputs[0].type.match(/^uint/)
        && balanceOf.constant
        && balanceOf.inputs.length === 1
        && balanceOf.inputs[0].type === 'address'
        && balanceOf.outputs.length === 1
        && balanceOf.outputs[0].type === 'uint256'
        && transfer
        && !transfer.constant
        && transfer.inputs.length === 2
        && transfer.inputs[0].type === 'address'
        && transfer.inputs[1].type === 'uint256'
      ) {

      return true;
    }
  }

  return false;
}

module.exports.lookupContract = lookupContract;
module.exports.verifySource = verifySource;
module.exports.callConstantFunction = callConstantFunction;
module.exports.getBalance = getBalance;
module.exports.toJson = toJson;
module.exports.addMetadata = addMetadata;
module.exports.isToken = isToken;
