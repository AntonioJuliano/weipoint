const mongoose = require('../helpers/db');
const bluebird = require('bluebird');
const Schema = mongoose.Schema;

const searchSchema = new Schema(
  {
    query: {
      type: Schema.Types.ObjectId,
      ref: 'Query'
    }
  },
  {
    timestamps: true
  }
);

searchSchema.index({"createdAt": 1});


const Search = mongoose.model('Search', searchSchema);
bluebird.promisifyAll(Search);

module.exports = Search;
