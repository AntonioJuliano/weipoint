/**
 * Created by antonio on 1/17/17.
 */
const mongoose = require('../helpers/db');
const Schema = mongoose.Schema;

// create a schema
const contractSchema = new Schema({
    name: 'string',
    address: {
        type: 'string',
        required: true,
        unique: true
    },
    code: { type: 'string', required: true },
    source: 'string',
    sourceType: 'string',
    sourceVersion: 'string',
    optimized: 'boolean',
    abi: 'array'
});

const Contract = mongoose.model('Contract', contractSchema);

module.exports = Contract;
