const Contract = require('../models/contract');
const Query = require('../models/query');
const Search = require('../models/search');
const logger = require('../helpers/logger');
const bugsnag = require('../helpers/bugsnag');

const MAX_RETRIES = 2;
const RETRY_DELAY = 500;

async function search(query, hydrate, index, size) {
  const es_query = {
    function_score: {
      query: {
        multi_match: {
          query: query,
          fields: ['tags.tag', 'description', 'link', 'name'],
          fuzziness: 'AUTO',
          prefix_length: 1
        }
      },
      field_value_factor: {
        field: 'score.value',
        modifier: 'ln1p',
        factor: 2,
        missing: 0
      }
    }
  };

  const result = await _search(es_query, hydrate, index, size, 0);

  // Don't wait for this to finish
  _logSearch(query, result);

  return result;
}

function searchAll(hydrate, index, size) {
  const es_query = {
    function_score: {
      query: {
        match_all: {}
      },
      field_value_factor: {
        field: 'score.value',
        modifier: 'ln1p',
        factor: 1,
        missing: 0
      }
    }
  };

  return _search(es_query, hydrate, index, size, 0);
}

async function suggestAutocomplete(query) {
  const es_query = {
    suggest: {
      prefix: query,
      completion: {
        field: 'value'
      }
    }
  };

  const result = await Query.esSearchAsync({'_source': 'suggest', suggest: es_query});
  const suggestions = result.suggest.suggest[0].options
    .filter( s => s._score > 0)
    .map( s => {
      return { value: s.text, score: s._score }
    });
  return suggestions;
}

async function _search(es_query, hydrate, index, size, numRetries) {
  let result;
  try {
    result = await Contract.esSearchAsync(
      {
        from: index || 0,
        size: size || 10,
        query: es_query
      },
      { hydrate: hydrate }
    );
  } catch (err) {
    if (numRetries >= MAX_RETRIES) {
      throw err;
    }
    const delay = ms => new Promise(r => setTimeout(r, ms));
    return delay(RETRY_DELAY).then( () => _search(es_query, hydrate, index, size, numRetries + 1));
  }

  let results;
  if (hydrate) {
    results = result.hits.hits.filter(r => r).map( r => {
      r.type = 'contract';
      return r;
    });
  } else {
    results = result.hits.hits.filter(r => r).map( r => r._source );
  }

  return {
    results: results,
    total: result.hits.total,
    took: result.took
  };
}

async function _logSearch(query, result) {
  try {
    let queryModel = await Query.findOne({ value: query.toLowerCase() }).exec();

    if (!queryModel) {
      queryModel = new Query({
        value: query.toLowerCase(),
        numResults: result.total,
        searches: [],
        type: 'contract'
      });
    }

    queryModel.numResults = result.total;

    await queryModel.save();
    const searchModel = new Search({ query: queryModel });
    await searchModel.save();
    queryModel.searches.push(searchModel);
    await queryModel.save();
  } catch (err) {
    logger.error({
      at: 'searchService#_logSearch',
      message: 'Failed to save search',
      query: query
    });
    bugsnag.notify(err);
  }
}

module.exports.search = search;
module.exports.searchAll = searchAll;
module.exports.suggestAutocomplete = suggestAutocomplete;
