const express = require('express');
const router = express.Router();
const ensService = require('../services/ensService');
const errors = require('../helpers/errors');
const errorHandler = require('../helpers/errorHandler');
const contractService = require('../services/contractService');

router.get('/', async(request, response) => {
  try {
    request.check({
      'domain': {
        in: 'query',
        isString: true,
        errorMessage: 'Invalid domain'
      }
    });

    const validationResult = await request.getValidationResult();
    if (!validationResult.isEmpty()) {
      throw new errors.RequestError(validationResult.array());
    }

    const splitDomain = request.query.domain.split('.');
    const tld = splitDomain[splitDomain.length - 1];
    const baseDomain = splitDomain[splitDomain.length - 2];

    if (tld !== 'eth') {
      throw new errors.RequestError(['Only eth domain supported']);
    }

    if (!baseDomain) {
      throw new errors.RequestError(['Invalid domain']);
    }

    const entry = await ensService.getDomainEntry(baseDomain);

    const resolvedAddress = await ensService.resolveDomainToAddress(request.query.domain);

    let contract = null;

    if (resolvedAddress) {
      const balance = await contractService.getBalance(resolvedAddress);
      try {
        contract = await contractService.lookupContract(resolvedAddress);
      } catch (e) {
        // Ignore not found
      }

      if (contract) {
        return response.status(200).json({
          type: 'contract',
          entry: entry,
          balance: balance,
          contract: contractService.toJson(contract),
          address: resolvedAddress
        });
      } else {
        return response.status(200).json({
          type: 'eoa',
          entry: entry,
          balance: balance,
          address: resolvedAddress
        });
      }
    }

    return response.status(200).json({
      entry: entry
    });
  } catch (e) {
    errorHandler.handle(e, response);
  }
});

module.exports = router;
