const mongoose = require('../helpers/db');
const bluebird = require('bluebird');
const Schema = mongoose.Schema;

const serviceSchema = new Schema({
  type: {
    type: String,
    required: true
  },
  userID: {
    type: String,
    required: true
  },
  proof: {
    type: String
  }
});

const verificationSchema = new Schema(
  {
    // For now this is always the keybase one
    serviceA: {
      type: serviceSchema,
      required: true
    },
    // For now this is always the ethereum address one
    serviceB: {
      type: serviceSchema,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Number
    }
  },
  {
    timestamps: true
  }
);

verificationSchema.index({ 'serviceA.userID': 1, 'serviceA.type': 1 });
verificationSchema.index({ 'serviceB.userID': 1, 'serviceB.type': 1 });
verificationSchema.index({
  'serviceA.userID': 1,
  'serviceA.type': 1,
  'serviceB.userID': 1,
  'serviceB.type': 1 },
  { unique: true }
);

const Verification = mongoose.model('Verification', verificationSchema);
bluebird.promisifyAll(Verification);

module.exports = Verification;
