const express = require('express');
const router = express.Router();
const contractService = require('../services/contractService');
const errors = require('../helpers/errors');
const errorHandler = require('../helpers/errorHandler');
const logger = require('../helpers/logger');
const optimusService = require('../services/optimusService');

router.get('/', async(request, response) => {
  try {
    request.check({
      'address': { in: 'query',
        isAddress: true,
        errorMessage: 'Invalid Address'
      }
    });

    const validationResult = await request.getValidationResult();
    if (!validationResult.isEmpty()) {
      throw new errors.RequestError(validationResult.array());
    }
    const address = request.query.address;
    logger.debug({
      at: 'contractController/',
      message: "Making contract request for address",
      address: address
    });
    const lookupPromise = contractService.lookupContract(address);
    const balancePromise = contractService.getBalance(address);
    const [contract, balance] = await Promise.all(
      [lookupPromise, balancePromise]
    );
    const id = contract === null ? null : contract.id;
    logger.debug({
      at: 'contractController/',
      message: "Got contract response",
      address: request.query.address,
      contract_id: id
    });

    let contractJson = contractService.toJson(contract);
    contractJson.balance = balance;
    if (contract === null) {
      return response.status(400).json({
        error: 'Not Found',
        errorCode: errors.errorCodes.notFound
      });
    } else {
      return response.status(200).json({
        contract: contractJson
      });
    }
  } catch (e) {
    errorHandler.handle(e, response);
  }
});

router.get('/compilerVersions', async(request, response) => {
  try {
    const compilerVersions = await optimusService.getSolidityCompilerVersions();
    response.status(200).json(compilerVersions);
  } catch (e) {
    errorHandler.handle(e, response);
  }
});

router.post('/source', async(request, response) => {
  try {
    request.check({
      'address': { in: 'body',
        isAddress: true,
        errorMessage: 'Invalid Address'
      },
      'source': { in: 'body',
        notEmpty: true,
        isString: true,
        errorMessage: 'Invalid Source'
      },
      'sourceType': { in: 'body',
        matches: {
          options: 'solidity|serpent'
        },
        errorMessage: 'Invalid Source Type'
      },
      'optimized': { in: 'body',
        notEmpty: true,
        isBoolean: true,
        errorMessage: 'Invalid Optimized'
      }
    });
    const validationResult = await request.getValidationResult();
    if (!validationResult.isEmpty()) {
      throw new errors.RequestError(validationResult.array());
    }
    logger.debug({
      at: 'contractController#/source',
      message: "Making contract request",
      address: request.body.address
    });
    const contract = await contractService.lookupContract(request.body.address);
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
    const updatedContract = await contractService.verifySource(
      contract,
      request.body.source,
      request.body.sourceType,
      request.body.compilerVersion,
      request.body.optimized
    );

    return response.status(200).json({
      contract: contractService.toJson(updatedContract)
    });
  } catch (e) {
    errorHandler.handle(e, response);
  }
});

router.post('/constantFunction', async (request, response) => {
  try {
    request.check({
      'address': {
        in: 'body',
        isAddress: true,
        errorMessage: 'Invalid Address'
      },
      'functionName': {
        in: 'body',
        notEmpty: true
      },
      'arguments': {
        in: 'body',
        isArray: true,
        errorMessage: 'Invalid Arguments'
      }
    });
    const validationResult = await request.getValidationResult();
    if (!validationResult.isEmpty()) {
      throw new errors.RequestError(validationResult.array());
    }
    logger.debug({
      at: 'contractController#constantFunction',
      message: "Making contract request",
      address: request.body.address
    });

    const contract = await contractService.lookupContract(request.body.address);
    const id = contract === null ? null : contract.id;
    logger.debug({
      at: 'contractController#constantFunction',
      message: "Got contract response",
      address: request.body.address,
      contract_id: id
    });

    if (contract === null) {
      throw new errors.ClientError(
        'Contract not found at address',
        errors.errorCodes.notFound
      );
    }
    if (contract.abi === null || contract.abi === undefined) {
      throw new errors.ClientError(
        'Contract does not have source code',
        errors.errorCodes.sourceNotAvailable
      );
    }

    const callResult = await contractService.callConstantFunction(
      contract,
      request.body.functionName,
      request.body.arguments
    );

    response.status(200).json({
      address: contract.address,
      result: callResult
    });
  } catch (e) {
    errorHandler.handle(e, response);
  }
});

router.post('/metadata', async (request, response) => {
  try {
    request.check({
      'address': {
        in: 'body',
        isAddress: true,
        errorMessage: 'Invalid Address'
      },
      'tags': {
        in: 'body',
        optional: true,
        isArrayOfStrings: true,
        errorMessage: 'Invalid Tags'
      },
      'description': {
        in: 'body',
        optional: true,
        isString: true,
        errorMessage: 'Invalid Description'
      },
      'link': {
        in: 'body',
        optional: true,
        isString: true,
        errorMessage: 'Invalid Link'
      },
      'name': {
        in: 'body',
        optional: true,
        isString: true,
        errorMessage: 'Invalid Name'
      }
    });
    const validationResult = await request.getValidationResult();
    if (!validationResult.isEmpty()) {
      throw new errors.RequestError(validationResult.array());
    }
    logger.debug({
      at: 'contractController#metadata',
      message: "Making contract request",
      address: request.body.address
    });

    const contract = await contractService.lookupContract(request.body.address);
    const id = contract === null ? null : contract.id;
    logger.debug({
      at: 'contractController#metadata',
      message: "Got contract response",
      address: request.body.address,
      contract_id: id
    });

    if (contract === null) {
      throw new errors.ClientError(
        'Contract not found at address',
        errors.errorCodes.notFound
      );
    }

    const updatedContract = await contractService.addMetadata(
      contract,
      {
        tags: request.body.tags,
        description: request.body.description,
        link: request.body.link,
        name: request.body.name
      }
    );

    response.status(200).json({
      address: contract.address,
      contract: contractService.toJson(updatedContract)
    });
  } catch (e) {
    errorHandler.handle(e, response);
  }
});

module.exports = router;
