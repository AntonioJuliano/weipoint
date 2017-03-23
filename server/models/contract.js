const mongoose = require('../helpers/db');
const Schema = mongoose.Schema;

const contractSchema = new Schema({
  name: 'string',
  address: {
    type: 'string',
    required: true,
    unique: true
  },
  code: {
    type: 'string',
    required: true
  },
  source: 'string',
  sourceType: 'string',
  sourceVersion: 'string',
  optimized: 'boolean',
  abi: 'array',
  libraries: 'mixed'
});

const Contract = mongoose.model('Contract', contractSchema);

module.exports = Contract;
