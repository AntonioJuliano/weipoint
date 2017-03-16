'use strict';

const express = require('express');
const router = express.Router();
const web3 = require('../helpers/web3');
const contractService = require('../services/contractService');
const errors = require('../helpers/errors');
const errorHandler = require('../helpers/errorHandler');
const logger = require('../helpers/logger');
const optimusService = require('../services/optimusService');
const Promise = require('bluebird');

router.get('/', async (request, response) => {
  request.check({
    'address': {
      in: 'query',
      isAddress: true,
      errorMessage: 'Invalid Address'
    }
  });

  const validationResult = await request.getValidationResult();
  if (!result.isEmpty()) {
    throw new errors.RequestError(result.array());
  }
  const address = request.query.address;
  logger.debug({
    at: 'contractController/',
    message: "Making contract request for address",
    address: address
  });
  const {contract, blockNumber} = contractService.lookupContract(address);
  const id = contract === null ? null : contract.id;
  logger.debug({
      at: 'contractController/',
      message: "Got contract response",
      address: request.query.address,
      contract_id: id
  });

  if (contract === null) {
    return response.status(400).json({
      error: 'Not Found',
      errorCode: errors.errorCodes.notFound,
      blockNumber: blockNumber
    })
  } else {
    return response.status(200).json({
      address: contract.address,
      name: contract.name,
      source: contract.source,
      sourceType: contract.sourceType,
      optimized: contract.optimized,
      code: contract.code,
      sourceVersion: contract.sourceVersion,
      blockNumber: blockNumber
    });
  }
});

router.get('/compilerVersions', async (request, response) => {
  const compilerVersions = optimusService.getSolidityCompilerVersions();
  response.status(200).json(compilerVersions);
});

router.post('/source', async (request, response) => {
  request.check({
    'address': {
      in: 'body',
      isAddress: true,
      errorMessage: 'Invalid Address'
    },
    'source': {
      in: 'body',
      notEmpty: true
    },
    'sourceType': {
      in: 'body',
      matches: {
        options: 'solidity|serpent'
      }
    }
  });
  const validationResult = await request.getValidationResult();
  if (!result.isEmpty()) {
    throw new errors.RequestError(result.array());
  }
  logger.debug({
    at: 'contractController#/source',
    message: "Making contract request",
    address: request.body.address
  });
  const { contract, blockNumber } = await contractService.lookupContract(request.body.address);
  const id = contract === null ? null : contract.id;
  logger.debug({
    at: 'contractController#/source',
    message: "Got contract response",
    address: request.body.address,
    contract_id: id
  });

  if (contract === null) {
    throw new errors.ClientError(
      'Contract not found at address',
      errors.errorCodes.notFound
    );
  } else if (contract.source !== undefined) {
    throw new errors.ClientError(
      'Contract already has source',
      errors.errorCodes.sourceAlreadyExists
    );
  }
  const compileResult = await contractService.verifySource(
    contract,
    request.body.source,
    request.body.sourceType,
    request.body.compilerVersion
  );

  contract.source = request.body.source;
  contract.sourceType = request.body.sourceType;
  contract.sourceVersion = request.body.compilerVersion;
  contract.name = compileResult.contractName;
  contract.abi = compileResult.abi;
  const saveResult = await contract.save();
  return response.status(200).json({
    address: contract.address,
    source: contract.source,
    sourceType: contract.sourceType,
    sourceVersion: contract.sourceVersion,
    optimized: contract.optimized,
    name: contract.name,
    code: contract.code,
    blockNumber: blockNumber
  });
});

module.exports = router;
