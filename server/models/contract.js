/**
 * Created by antonio on 1/17/17.
 */
const mongoose = require('./db');
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
    sourceType: 'string'
});

// the schema is useless so far
// we need to create a model using it
const Contract = mongoose.model('Contract', contractSchema);

// make this available to our users in our Node applications
module.exports = Contract;
