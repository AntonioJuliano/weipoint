const Web3 = require("web3");
const express = require('express');
const app = express();
const port = 3001;
const web3 = new Web3();
const expressValidator = require('express-validator');
const bodyParser = require('body-parser');
const bluebirdPromise = require("bluebird");
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
// bluebirdPromise.promisifyAll(web3.eth);

const getCode = function (address) {
    return new Promise(function(resolve,reject){
        web3.eth.getCode(address,function(err,data){
            if(err !== null) return reject(err);
            console.log(data);
            resolve(data);
        });
    });
};

app.use(bodyParser.json());
app.use(expressValidator({
    customValidators: {
        isAddress: function(value) {
            return web3.isAddress(value);
        }
    }
}));


app.get('/api/v1/contract', (request, response) => {
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
        console.log("Making contract request to geth for address: " + request.query.address);
        return getCode(request.query.address);
    }).then(function(contract) {
        console.log("Got contract response from geth: " + contract);

        response.status(200).json({
            code: contract
        });
    }).catch(function(error) {
            if (error !== 'ignore') {
                console.error(error);
                if (!response.headerSent) {
                    response.status(500).send('Server Error');
                }
            }
        }
    );
});

// Error handler
app.use((err, request, response, next) => {
    // log the error, for now just console.log
    console.log(err);
    response.status(500).send('Server Error');
});

app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log(`server is listening on ${port}`)
});