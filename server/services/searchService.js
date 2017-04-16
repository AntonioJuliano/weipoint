const Contract = require('../models/contract');

const MAX_RETRIES = 2;
const RETRY_DELAY = 500;

async function search(query, hydrate, index, size, numRetries) {
  if (!numRetries) {
    numRetries = 0;
  }

  const es_query = {
    nested: {
      path: 'tags',
      score_mode: 'max',
      query: {
        match: {
          'tags.tag': {
            query: query,
            fuzziness: 'AUTO',
            prefix_length: 1
          }
        }
      }
    }
  };

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
    return delay(RETRY_DELAY).then( () => search(query, hydrate, index, size, numRetries + 1));
  }

  let results;
  if (hydrate) {
    results = result.hits.hits.map( r => {
      r.type = 'contract';
      return r;
    });
  } else {
    results = result.hits.hits.map( r => r._source );
  }

  return {
    results: results,
    total: result.hits.total,
    took: result.took
  };
}

module.exports.search = search;
