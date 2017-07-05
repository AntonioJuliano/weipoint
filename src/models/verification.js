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
    services: {
      type: [serviceSchema],
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

// TODO indexes
// verificationSchema.index({ "owner.value": 1, 'owner.type': 1 });
// verificationSchema.index({ "target.value": 1, 'target.type': 1 });

const Verification = mongoose.model('Verification', verificationSchema);
bluebird.promisifyAll(Verification);

module.exports = Verification;
