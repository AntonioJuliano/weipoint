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
                code: errorCodes.invalidArguments
            });
            return Promise.reject('ignore');
        }
    }).then(function(result) {
        console.log("Making contract request for address: " + request.query.address);
        return contractService.lookupContract(request.query.address);
    }).then(function(contract) {
        console.log("Got contract response from geth: " + contract);

        if (contract === null) {
            response.status(400).json({
                error: 'Not Found',
                code: errorCodes.notFound
            })
        } else {
            response.status(200).json({
                code: contract
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
    request.body({
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
                options: ['solidity', 'serpent']
            }
        }
    });
    request.getValidationResult().then(function(result) {
        if (!result.isEmpty()) {
            response.status(400).json({
                errors: result.array(),
                code: errorCodes.invalidArguments
            });
            return Promise.reject('ignore');
        }
    }).then(function(result) {
        console.log("Making contract request for address: " + request.query.address);
        return contractService.lookupContract(request.query.address);
    }).then(function(contract) {
        console.log("Got contract response from geth: " + contract);

        if (contract === null) {
            response.status(400).json({
                error: 'Contract not found at address',
                code: errorCodes.notFound
            });
            return Promise.reject('ignore');
        } else if (contract.code !== null) {
            response.status(400).json({
                error: 'Contract already has source',
                code: errorCodes.sourceAlreadyExists
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