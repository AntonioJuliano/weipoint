const Web3 = require("web3");
const express = require('express');
const app = express();
const port = 3001;
const web3 = new Web3();
const expressValidator = require('express-validator');
const bodyParser = require('body-parser');
const bluebirdPromise = require("bluebird");
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
bluebirdPromise.promisifyAll(web3.eth);

app.use(bodyParser.json());
app.use(expressValidator({
    customValidators: {
        isAddress: function(value) {
            return web3.isAddress(value);
        }
    }
}));

app.use(function(request, response, next) {
    console.log({
        message: 'Received request',
        url: request.url,
        method: request.method,
        headers: request.headers,
        query: request.query,
        body: request.body
    })
    return next();
});

app.get('/api/v1/contract', (request, response) => {
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
        console.log("Making contract request to geth for address: " + request.query.address);
        return web3.eth.getCodeAsync(request.query.address);
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

// Error handler
app.use((err, request, response, next) => {
    // log the error, for now just console.log
    console.log(err);
    response.status(500).send('Server Error');
});

app.use(function(req, res, next) {
    res.status(404);
    res.json({ error: "Not Found"});
});

app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log(`server is listening on ${port}`)
});