/**
 * Created by antonio on 1/17/17.
 */
const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost/test");

mongoose.Promise = global.Promise;

module.exports = mongoose;