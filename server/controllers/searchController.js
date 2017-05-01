const express = require('express');
const router = express.Router();
const searchService = require('../services/searchService');
const contractService = require('../services/contractService');
const errors = require('../helpers/errors');
const errorHandler = require('../helpers/errorHandler');
const logger = require('../helpers/logger');

router.get('/', async(request, response) => {
  try {
    request.check({
      'query': {
        in: 'query',
        isString: true,
        errorMessage: 'Invalid Query'
      },
      'index': {
        in: 'query',
        optionalPositiveInteger: true,
        errorMessage: 'Invalid Index'
      },
      'size': {
        in: 'query',
        optionalPositiveInteger: true,
        errorMessage: 'Invalid Size'
      }
    });

    const validationResult = await request.getValidationResult();
    if (!validationResult.isEmpty()) {
      throw new errors.RequestError(validationResult.array());
    }

    let searchResults;
    const index = request.query.index ? parseInt(request.query.index) : 0;
    const size = request.query.size ? parseInt(request.query.size) : 10;
    if (request.query.query !== '') {
      searchResults = await searchService.search(request.query.query, true, index, size);
    } else {
      searchResults = await searchService.searchAll(true, index, size);
    }

    logger.info({
      at: 'searchController/',
      message: 'Received results for search query',
      query: request.query.query,
      size: searchResults.results.length,
      total: searchResults.total,
      time: searchResults.took
    });

    return response.status(200).json({
      results: searchResults.results.map( r => contractService.toJson(r) ),
      total: searchResults.total
    });
  } catch (e) {
    errorHandler.handle(e, response);
  }
});

router.get('/autocomplete', async(request, response) => {
  try {
    request.check({
      'query': {
        in: 'query',
        isString: true,
        errorMessage: 'Invalid Query'
      }
    });

    const validationResult = await request.getValidationResult();
    if (!validationResult.isEmpty()) {
      throw new errors.RequestError(validationResult.array());
    }

    const suggestResults = await searchService.suggestAutocomplete(request.query.query);

    logger.info({
      at: 'searchController/autocomplete',
      message: 'Received suggest results for search query',
      query: request.query.query,
      results: suggestResults
    });

    return response.status(200).json({
      results: suggestResults
    });
  } catch (e) {
    errorHandler.handle(e, response);
  }
});

module.exports = router;
