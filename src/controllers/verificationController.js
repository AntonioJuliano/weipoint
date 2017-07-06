const express = require('express');
const router = express.Router();
const verificationService = require('../services/verificationService');
const errorHandler = require('../helpers/errorHandler');
const errors = require('../helpers/errors');

router.post('/', async (request, response) => {
  try {
    request.check({
      services: {
        in: 'body',
        isArray: true,
        errorMessage: 'Invalid services'
      },
      version: {
        in: 'body',
        isInt: true
      },
      timestamp: {
        in: 'body',
        isInt: true
      }
    });
    const validationResult = await request.getValidationResult();
    if (!validationResult.isEmpty()) {
      throw new errors.RequestError(validationResult.array());
    }

    const verification = await verificationService.addVerification(request.body);

    response.status(200).json(verification);
  } catch (e) {
    errorHandler.handle(e, response);
  }
});

router.get('/', async (request, response) => {
  try {
    request.check({
      type: {
        in: 'query',
        isString: true,
      },
      userID: {
        in: 'query',
        isString: true,
      },
    });
    const validationResult = await request.getValidationResult();
    if (!validationResult.isEmpty()) {
      throw new errors.RequestError(validationResult.array());
    }

    const verifications = await verificationService.getVerifications(request.query);

    response.status(200).json(verifications);
  } catch (e) {
    errorHandler.handle(e, response);
  }
});

module.exports = router;
