const web3 = require('../helpers/web3');
const Verification = require('../models/verification');
const errors = require('../helpers/errors');

const VERIFICATION_TYPES = {
  KEYBASE: 'keybase',
  ETHEREUM_ADDRESS: 'ethereum_address'
}

async function addVerification({ services, version, timestamp }) {
  _validateVerification(services, version, timestamp);

  const verifyPromises = services.forEach( s => _verifyVerification(s));

  await Promise.all(verifyPromises);

  const verification = new Verification({
    services: services.map( s => {
      return {
        type: s.type,
        userID: s.userID,
        proof: s.proof
      };
    }),
    message: _getMessage(services, version, timestamp)
  });

  await verification.save();
}

function _verifyVerification(v) {
  switch (v.type) {
  case VERIFICATION_TYPES.KEYBASE:
    return _verifyKeybaseVerification(v);
  case VERIFICATION_TYPES.ETHEREUM_ADDRESS:
    return _verifyEthereumAddressVerification(v);
  default:
    throw new errors.ClientError(
      "Invalid verification type",
      errors.errorCodes.invalidType
    );
  }
}

function _verifyKeybaseVerification(v) {

}

function _verifyEthereumAddressVerification(v) {

}

function _getMessage(services, version, timestamp) {
  const jsonMessage = {
    verifier: 'weipoint',
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
