/**
 * Created by antonio on 1/16/17.
 */
const express = require('express');
const router = express.Router();
const web3 = require('../helpers/web3');
const contractService = require('../services/contractService');
const errorCodes = require('../helpers/errorCodes');

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
            response.status(400).json({
                errors: result.array(),
                errorCode: errorCodes.invalidArguments
            });
            return Promise.reject('ignore');
        }
    }).then(function(result) {
        const address = request.query.address;
        console.log("Making contract request for address: " + address);
        return contractService.lookupContract(address);
    }).then(function(results) {
        const contract = results.contract;
        const blockNumber = results.blockNumber;

        console.log("Got contract response from geth: " + contract);

        if (contract === null) {
            response.status(400).json({
                error: 'Not Found',
                errorCode: errorCodes.notFound,
                blockNumber: blockNumber
            })
        } else {
            response.status(200).json({
                address: contract.address,
                source: contract.source,
                sourceType: contract.sourceType,
                code: contract.code,
                blockNumber: blockNumber
            });
        }
    }).catch(function(error) {
            if (error !== 'ignore') {
                console.error(error);
                if (!response.headerSent) {
                    response.status(500).json({ error: 'Server Error' });
                }
            }
        }
    );
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
            response.status(400).json({
                errors: result.array(),
                errorCode: errorCodes.invalidArguments
            });
            return Promise.reject('ignore');
        }
    }).then(function(result) {
        console.log("Making contract request for address: " + request.body.address);
        return contractService.lookupContract(request.body.address);
    }).then(function(results) {
        contract = results.contract;
        blockNumber = results.blockNumber;
        console.log("Got contract response from geth: " + contract);

        if (contract === null) {
            response.status(400).json({
                error: 'Contract not found at address',
                errorCode: errorCodes.notFound
            });
            return Promise.reject('ignore');
        } else if (contract.source !== undefined) {
            console.log("Existing source: " + contract.source);
            response.status(400).json({
                error: 'Contract already has source',
                errorCode: errorCodes.sourceAlreadyExists
            });
            return Promise.reject('ignore');
        } else {
            if (request.body.sourceType === 'solidity') {
                return web3.eth.compile.solidity(request.body.source);
            } else if (request.body.type === 'serpent') {
                return web3.eth.compile.serpent(request.body.source);
            } else {
                return Promise.reject(new Error('Invalid sourceType'));
            }
        }
    }).then(function(compileResult) {
        if (compileResult === contract.source) {
            contract.code = request.body.source;
            contract.sourceType = request.body.sourceType;
            return contract.save();
        } else {
            return Promise.reject(new Error('Source did not match code'))
        }
    }).then(function(saveResult) {
        response.status(200).json({
            address: contract.address,
            source: contract.source,
            sourceType: contract.sourceType,
            code: contract,
            blockNumber: blockNumber
        });
    }).catch(function(error) {
            if (error !== 'ignore') {
                console.error(error);
                if (!response.headerSent) {
                    response.status(500).json({ error: 'Server Error' });
                }
            }
        }
    );
});

module.exports = router;