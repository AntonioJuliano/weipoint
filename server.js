const express = require('express');
const app = express();
const port = 3001;
const expressValidator = require('express-validator');
const bodyParser = require('body-parser');
const web3 = require('./server/helpers/web3');
const errorCodes = require('./server/helpers/errorCodes');

app.use(bodyParser.json());
app.use(expressValidator({
    customValidators: {
        isAddress: function(value) {
            return web3.isAddress(value);
        }
    }
}));
app.use(require('./server/middlewares/requestLogger'));

app.use('/', require('./server/controllers/index'));

// Error handler
app.use((err, request, response, next) => {
    // log the error, for now just console.log
    console.error(err);
    response.status(500).json({ error: 'Server Error', errorCode: errorCodes.serverError });
});

app.use(function(req, res, next) {
    res.status(404).json({ error: "Not Found", errorCode: errorCodes.notFound });
});

app.listen(port, (err) => {
    if (err) {
        return console.error('Server failed to start', err)
    }

    console.log(`server is listening on ${port}`)
});
