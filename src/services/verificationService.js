const web3 = require('../helpers/web3');
const Verification = require('../models/verification');
const errors = require('../helpers/errors');
const keybaseService = require('./keybaseService');
const sigUtil = require('eth-sig-util');

const VERIFICATION_TYPES = {
  KEYBASE: 'keybase',
  ETHEREUM_ADDRESS: 'ethereum_address'
}

async function addVerification({ services, version, timestamp }) {
  _validateVerification(services, version, timestamp);

  const verifyPromises = services.map(
    s => _verifyVerification(s, _getMessage(services, version, timestamp))
  );

  await Promise.all(verifyPromises);

  const keybaseVerification = services.map( s => {
    return {
      type: s.type,
      userID: s.userID,
      proof: s.proof
    };
  }).find( s => s.type === VERIFICATION_TYPES.KEYBASE );
  const ethereumAddressVerification = services.map( s => {
    return {
      type: s.type,
      userID: s.userID,
      proof: s.proof
    };
  }).find( s => s.type === VERIFICATION_TYPES.ETHEREUM_ADDRESS );

  const existingVerification = await Verification.findOne({
    'serviceA.userID': keybaseVerification.userID,
    'serviceA.type': VERIFICATION_TYPES.KEYBASE,
    'serviceB.userID': ethereumAddressVerification.userID,
    'serviceB.type': VERIFICATION_TYPES.ETHEREUM_ADDRESS,
  }).exec();

  if (existingVerification) {
    return existingVerification;
  }

  const verification = new Verification({
    serviceA: keybaseVerification,
    serviceB: ethereumAddressVerification,
    message: _getMessage(services, version, timestamp),
    timestamp: timestamp
  });

  await verification.save();

  return verification;
}

function _verifyVerification(v, message) {
  switch (v.type) {
  case VERIFICATION_TYPES.KEYBASE:
    return _verifyKeybaseVerification(v, message);
  case VERIFICATION_TYPES.ETHEREUM_ADDRESS:
    return _verifyEthereumAddressVerification(v, message);
  default:
    throw new errors.ClientError(
      "Invalid verification type",
      errors.errorCodes.invalidType
    );
  }
}

function _verifyKeybaseVerification(v, message) {
  return keybaseService.verifySignature(v.proof, v.userID, message);
}

function _verifyEthereumAddressVerification(v, message) {
  const signingAddress = sigUtil.recoverPersonalSignature({ data: message, sig: v.proof });

  if (signingAddress !== v.userID) {
    throw new errors.ClientError(
      'Incorrect signing ethereum address',
      errors.errorCodes.invalidVerification
    );
  }

  return true;
}

function _getMessage(services, version, timestamp) {
  const jsonMessage = {
    verifier: 'weipoint',
    type: 'link',
    services: services.map( s => {
      return { type: s.type, userID: s.userID };
    }),
    version: version,
    timestamp: timestamp
  };

  return JSON.stringify(jsonMessage);
}

function _validateVerification(services, version, timestamp) {
  if (services.length !== 2) {
    throw new errors.ClientError(
      'Invalid number of services',
      errors.errorCodes.invalidVerification
    );
  }
  const keybase = services.find( s => s.type === VERIFICATION_TYPES.KEYBASE);
  const ethereumAddress = services.find( s => s.type === VERIFICATION_TYPES.ETHEREUM_ADDRESS);

  if (!keybase) {
    throw new errors.ClientError(
      'Keybase service not found',
      errors.errorCodes.invalidVerification
    );
  }
  if (!keybase.userID.match(/^[a-zA-Z0-9]+$/)) {
    throw new errors.ClientError(
      'Keybase userID invalid',
      errors.errorCodes.invalidVerification
    );
  }
  if (!ethereumAddress) {
    throw new errors.ClientError(
      'Keybase service not found',
      errors.errorCodes.invalidVerification
    );
  }
  if (!web3.isAddress(ethereumAddress.userID)) {
    throw new errors.ClientError(
      'Ethereum address invalid',
      errors.errorCodes.invalidVerification
    );
  }
  if (!Number.isInteger(timestamp) || (new Date(timestamp)).getTime() <= 0) {
    throw new errors.ClientError(
      'Timestamp invalid',
      errors.errorCodes.invalidVerification
    );
  }
}

module.exports.addVerification = addVerification;
