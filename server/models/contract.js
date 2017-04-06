const mongoose = require('../helpers/db');
const elasticsearch = require('../helpers/elasticsearch');
const bluebird = require('bluebird');
const Schema = mongoose.Schema;

// IMPORTANT if you make a breaking change to the schema, increment this number
// and synchronize the new index on console
const esVersionNumber = 1;

// TODO validate no duplicate tags
const tagSchema = new Schema({
  tag: { type: String, es_indexed: 'true', es_type: 'text' }
});

const contractSchema = new Schema({
  name: { type: String, es_indexed: true, es_type: 'text' },
  address: {
    type: String,
    es_indexed: true,
    es_type: 'keyword',
    required: true,
    unique: true
  },
  code: {
    type: String,
    required: true
  },
  source: String,
  sourceType: String,
  sourceVersion: String,
  optimized: Boolean,
  abi: [Schema.Types.Mixed],
  tags: {
    type: [tagSchema],
    es_indexed: true,
    es_type: 'nested',
    es_include_in_parent: true
  },
  libraries: Schema.Types.Mixed
});

elasticsearch.plugin(contractSchema, esVersionNumber, 'contract');

const Contract = mongoose.model('Contract', contractSchema);
bluebird.promisifyAll(Contract);

elasticsearch.connect(Contract, esVersionNumber, 'contract');

module.exports = Contract;
