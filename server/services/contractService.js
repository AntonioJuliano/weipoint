const Contract = require('../models/contract');
const web3 = require('../helpers/web3');
const compilerService = require('./compilerService');
const errors = require('../helpers/errors');
const logger = require('../helpers/logger');

function lookupContract(address) {
    const blockNumberPromise = web3.eth.getBlockNumberAsync();
    let globalBlockNumber;

    return blockNumberPromise.then(function(blockNumber) {
        globalBlockNumber = blockNumber;
        const dbPromise = Contract.findOne({ address: address }).exec();
        const web3Promise = web3.eth.getCodeAsync(address, blockNumber);

        return Promise.all([dbPromise, web3Promise])
    }).then(function(results) {
        const dbResult = results[0];
        const web3Result = results[1];

        if (dbResult !== null) {
            return { contract: dbResult, blockNumber: globalBlockNumber };
        } else if (web3Result !== null && web3Result !== '0x') {
            const newContract = new Contract({ address: address, code: web3Result });
            return newContract.save().then(function(result) {
                logger.info({
                  at: 'contractService#lookupContract',
                  message: 'Saving new contract to db',
                  address: address
                });
                return { contract: newContract, blockNumber: globalBlockNumber };
            });
        } else {
            return { contract: null, blockNumber: globalBlockNumber };
        }
    })
}

function verifySource(contract, source, sourceType, compilerVersion) {
    if (sourceType === 'solidity') {
      return compilerService.compileSolidity(source, compilerVersion, true)
        .then(function(contracts) {
          for (const contractName in contracts) {
            const compiledContract = contracts[contractName];
            if (compiledContract.runtimeBytecode === contract.code.replace('0x', '')) {
              logger.info({
                at: 'contractService#verifySource',
                message: 'Found matching source code for contract',
                address: contract.address
              });
              return Promise.resolve({
                  contractName: contractName
              });
            }
          }
          return Promise.reject(new errors.ClientError(
              "Source did not match contract bytecode",
              errors.errorCodes.sourceMismatch
          ));
        });
    } else if (request.body.type === 'serpent') {
        // TODO
        return Promise.reject(new Error('Serpent not yet supported'));
    } else {
        return Promise.reject(new Error('Invalid sourceType'));
    }
}

module.exports.lookupContract = lookupContract;
module.exports.verifySource = verifySource;
