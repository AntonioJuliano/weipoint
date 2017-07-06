const kbpgp = require('kbpgp');
const bluebird = require('bluebird');
const fetch = require('node-fetch');
const errors = require('../helpers/errors');

bluebird.promisifyAll(kbpgp);
bluebird.promisifyAll(kbpgp.KeyManager);

async function getPublicKey(username) {
  const pubKeyResponse = await fetch('https://keybase.io/' + username + '/pgp_keys.asc');

  if (pubKeyResponse.status !== 200) {
    throw new errors.ClientError(
      'Keybase user key not found',
      errors.errorCodes.invalidVerification
    );
  }
  const pubKey = await pubKeyResponse.text();
  if (pubKey === 'SELF-SIGNED PUBLIC KEY NOT FOUND') {
    throw new errors.ClientError(
      'Keybase user key not found',
      errors.errorCodes.invalidVerification
    );
  }

  return pubKey;
}

async function verifySignature(signature, username, expectedMessage) {
  // TODO what if user has more than one key
  // TODO cache this request
  const pubKey = await getPublicKey(username);

  const keyManager = await kbpgp.KeyManager.import_from_armored_pgpAsync({ armored: pubKey });

  let result = null;
  try {
    result = await kbpgp.unboxAsync({ keyfetch: keyManager, armored: signature });
  } catch(e) {
    switch (e.message) {
    case 'No keys match the given key IDs':
      throw new errors.ClientError(
        'Signed by incorrect Keybase user',
        errors.errorCodes.invalidVerification
      );
    case 'checksum mismatch':
    case 'no header found':
      throw new errors.ClientError(
        'Invalid Keybase signature',
        errors.errorCodes.invalidVerification
      );
    default:
      throw e;
    }
  }

  const message = result[0].toString();

  if (expectedMessage !== message) {
    throw new errors.ClientError(
      'Keybase signature for wrong message',
      errors.errorCodes.invalidVerification
    );
  }

  return true;
}

module.exports.verifySignature = verifySignature;
module.exports.getPublicKey = getPublicKey;
