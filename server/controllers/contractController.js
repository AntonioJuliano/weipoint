/**
 * Created by antonio on 1/16/17.
 */
const express = require('express');
const router = express.Router();
const web3 = require('../helpers/web3');
const contractService = require('../services/contractService');

router.get('/', (request, response) => {
    console.log("A");
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
                errors: result.array()
            });
            return Promise.reject('ignore');
        }
    }).then(function(result) {
        console.log("Making contract request for address: " + request.query.address);
        contractService.lookupContract(request.query.address);
    }).then(function(contract) {
        console.log("Got contract response from geth: " + contract);

        response.status(200).json({
            code: contract
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