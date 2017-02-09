const dotenv = require('dotenv');
dotenv.load();

const express = require('express');
const app = express();
const port = 3001;
const expressValidator = require('express-validator');
const bodyParser = require('body-parser');
const web3 = require('./helpers/web3');
const errors = require('./helpers/errors');
const logger = require('./helpers/logger');
const path = require('path');

app.use(express.static('../client/build'));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.use(bodyParser.json());
app.use(function(error, request, response, next) {
    console.log(error);
    response.status(400).json({
        error: 'Invalid Request',
        errorCode: errors.errorCodes.invalidArguments
    });
});
app.use(expressValidator({
    customValidators: {
        isAddress: function(value) {
            return web3.isAddress(value);
        }
    }
}));
app.use(require('./middlewares/requestLogger'));

app.use('/', require('./controllers/index'));

// Error handler
app.use((error, request, response, next) => {
    console.log(error);
    logger.error({
        at: 'server#errorHandler',
        message: 'Unhandled Error thrown',
        error: error
    });

    response.status(500).json({
        error: 'Server Error',
        errorCode: errors.errorCodes.serverError
    });
});

app.use(function(req, res, next) {
    res.status(404).json({ error: "Not Found", errorCode: errors.errorCodes.notFound });
});

app.listen(port, (error) => {
    if (error) {
        logger.error({
            at: 'server#start',
            message: 'Server failed to start',
            error: error
        });
    }

    logger.info({
        at: 'server#start',
        message: `server is listening on ${port}`
    })
});
