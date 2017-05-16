const ens = require('../helpers/ens');
const Registrar = require('eth-registrar-ens');
const web3 = require('../helpers/web3');
const bluebird = require('bluebird');
const interfaces = require('eth-registrar-ens/lib/interfaces');

let registrar;

async function init() {
  const promise = new Promise((resolve, reject) => {
    try {
      registrar = new Registrar(web3, ens, 'eth', 7, (err, _result) => {
        if (err) {
          return reject(err);
        }
        //TODO: Check that the registrar is correctly instanciated
        resolve();
      });
    } catch(e) {
      reject('Error initialiting ENS registrar: ' + e);
    }
  });

  // Hack because library wasn't working by itself
  const result = await ens.owner(registrar.tld);
  registrar.address = result;
  registrar.contract = web3.eth.contract(interfaces.registrarInterface).at(result);

  await registrar.contract.registryStarted(function (startingErr, startingDate) {
    registrar.registryStarted = startingDate;
  });
  // end hack
  bluebird.promisifyAll(registrar);

  return promise;
}

init().then( () => bluebird.promisifyAll(registrar));

/**
 * Resolves an ens (ethereum name service) domain to an address. Throws
 * an error if the name cannot be resolved to an address
 *
 * @param  {String} domain domain to resolve (e.g. weipoint.eth)
 * @return {String}        address the domain resolves to
 * @throws {errors.ClientError} if the domain does not resolve to an address
 */
async function resolveDomainToAddress(domain) {
  let address;
  try {
    address = await ens.resolver(domain.toLowerCase()).addr();
  } catch (e) {
    return null
  }

  return address;
}

function getDomainEntry(domain) {
  return registrar.getEntryAsync(domain);
}

module.exports.resolveDomainToAddress = resolveDomainToAddress;
module.exports.getDomainEntry = getDomainEntry;
