const mongoose = require('../helpers/db');
const elasticsearch = require('../helpers/elasticsearch');
const bluebird = require('bluebird');
const Schema = mongoose.Schema;

// IMPORTANT if you make a breaking change to the elasticsearch schema, increment this number
const esVersionNumber = 1;

const querySchema = new Schema(
  {
    value: {
      type: String,
      index: true,
      unique: true,
      required: true,
      es_indexed: true,
      es_type: 'completion',
      es_analyzer: 'simple',
      es_search_analyzer: 'simple'
    },
    numResults: {
      type: Number,
      es_indexed: true,
      required: true,
      min: 0
    },
    searches: [{ type: Schema.Types.ObjectId, ref: 'Search', es_indexed: true }],
    type: {
      type: String,
      es_indexed: true,
      es_type: 'keyword',
      required: true
    }
  },
  {
    timestamps: true
  }
);

function es_transform(model, _repo) {
  return {
    value: {
      input: model.value,
      weight: Math.round(10 * model.numResults * Math.log(model.searches.length + 1))
    },
    type: model.type
  }
}

elasticsearch.plugin(querySchema, esVersionNumber, 'query', es_transform);

const Query = mongoose.model('Query', querySchema);
bluebird.promisifyAll(Query);

elasticsearch.connect(Query, esVersionNumber, 'query');

module.exports = Query;
