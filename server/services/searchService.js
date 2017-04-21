const Contract = require('../models/contract');

const MAX_RETRIES = 2;
const RETRY_DELAY = 500;

function search(query, hydrate, index, size) {
  const es_query = {
    multi_match: {
      query: query,
      fields: ['tags.tag', 'description', 'link', 'name'],
      fuzziness: 'AUTO',
      prefix_length: 1
    }
  };

  return _search(es_query, hydrate, index, size, 0);
}

function searchAll(hydrate, index, size) {
  const es_query = {
    match_all: {}
  };

  return _search(es_query, hydrate, index, size, 0);
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

module.exports.search = search;
module.exports.searchAll = searchAll;
