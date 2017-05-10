const express = require('express');
const router = express.Router();
const coinbase = require('../helpers/coinbase');
const errorHandler = require('../helpers/errorHandler');

router.get('/price', (request, response) => {
  try {
    return response.status(200).json({
      usd: coinbase.getPrice()
    });
  } catch (e) {
    errorHandler.handle(e, response);
  }
});

module.exports = router;
