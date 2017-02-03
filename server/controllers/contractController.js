/**
 * Created by antonio on 1/16/17.
 */
const express = require('express');
const router = express.Router();
const web3 = require('../helpers/web3');
const contractService = require('../services/contractService');
const errors = require('../helpers/errors');
const errorHandler = require('../helpers/errorHandler');
const logger = require('../helpers/logger');

router.get('/', (request, response) => {
    request.check({
        'address': {
            in: 'query',
            isAddress: true,
            errorMessage: 'Invalid Address'
        }
    });
    request.getValidationResult().then(function(result) {
        if (!result.isEmpty()) {
            return Promise.reject(new errors.RequestError(result.array()));
        }
    }).then(function(result) {
        const address = request.query.address;
        logger.debug({
            at: 'contractController/',
            message: "Making contract request for address",
            address: address
        });
        return contractService.lookupContract(address);
    }).then(function(results) {
        const contract = results.contract;
        const blockNumber = results.blockNumber;

        logger.debug({
            at: 'contractController/',
            message: "Got contract response",
            address: request.body.address,
            contract: contract
        });

        if (contract === null) {
            response.status(400).json({
                error: 'Not Found',
                errorCode: errors.errorCodes.notFound,
                blockNumber: blockNumber
            })
        } else {
            response.status(200).json({
                address: contract.address,
                name: contract.name,
                source: contract.source,
                sourceType: contract.sourceType,
                code: contract.code,
                blockNumber: blockNumber
            });
        }
    }).catch(function(error) {
        errorHandler.handle(error, response);
    });
});

router.post('/source', (request, response) => {
    let contract;
    let blockNumber;
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
    request.getValidationResult().then(function(result) {
        if (!result.isEmpty()) {
            return Promise.reject(new errors.RequestError(result.array()));
        }
    }).then(function(result) {
        logger.debug({
            at: 'contractController#/source',
            message: "Making contract request",
            address: request.body.address
        });

        return contractService.lookupContract(request.body.address);
    }).then(function(results) {
        contract = results.contract;
        blockNumber = results.blockNumber;

        logger.debug({
            at: 'contractController#/source',
            message: "Got contract response",
            address: request.body.address,
            contract: contract
        });

        if (contract === null) {
            return Promise.reject(new errors.ClientError(
                'Contract not found at address',
                errors.errorCodes.notFound
            ));
        } else if (contract.source !== undefined) {
            return Promise.reject(new errors.ClientError(
                'Contract already has source',
                errors.errorCodes.sourceAlreadyExists
            ));
        } else {
            return contractService.verifySource(
                contract,
                request.body.source,
                request.body.sourceType,
                request.body.compilerVersion
            );
        }
    }).then(function(compileResult) {
        contract.code = request.body.source;
        contract.sourceType = request.body.sourceType;
        contract.sourceVersion = compileResult.sourceVersion;
        contract.name = compileResult.contractName;
        return contract.save();
    }).then(function(saveResult) {
        response.status(200).json({
            address: contract.address,
            source: contract.source,
            sourceType: contract.sourceType,
            sourceVersion: contract.sourceVersion,
            name: contract.name,
            code: contract.code,
            blockNumber: blockNumber
        });
    }).catch(function(error) {
        errorHandler.handle(error, response);
    });
});

module.exports = router;
