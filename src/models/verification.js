const mongoose = require('../helpers/db');
const bluebird = require('bluebird');
const Schema = mongoose.Schema;

const targetSchema = new Schema({
  type: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  proof: {
    type: String
  }
});

const verificationSchema = new Schema(
  {
    owner: {
      type: targetSchema,
      required: true
    },
    target: {
      type: targetSchema,
      required: true
    }
  },
  {
    timestamps: true
  }
);

verificationSchema.index({ "owner.value": 1, 'owner.type': 1 });
verificationSchema.index({ "target.value": 1, 'target.type': 1 });

const Verification = mongoose.model('Verification', verificationSchema);
bluebird.promisifyAll(Verification);

module.exports = Verification;
