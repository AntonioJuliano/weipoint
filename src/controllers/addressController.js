const express = require('express');
const router = express.Router();
const tokenService = require('../services/tokenService');
const errorHandler = require('../helpers/errorHandler');
const errors = require('../helpers/errors');

router.get('/tokenBalances', async (request, response) => {
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

    const balances = await tokenService.getBalances(request.query.address);

    response.status(200).json({
      balances: balances
    });
  } catch (e) {
    errorHandler.handle(e, response);
  }
});

module.exports = router;
