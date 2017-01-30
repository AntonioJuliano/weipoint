/**
 * Created by antonio on 1/18/17.
 */

const Contract = require('../models/contract');
const web3 = require('../helpers/web3');
const solc = require('../helpers/solc');
const errors = require('../helpers/errors');

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
        console.log(dbResult);
        console.log(web3Result);

        if (dbResult !== null) {
            console.log('found from database');
            return { contract: dbResult, blockNumber: globalBlockNumber };
        } else if (web3Result !== null && web3Result !== '0x') {
            console.log('found from web3');

            const newContract = new Contract({ address: address, code: web3Result });
            return newContract.save().then(function(result) {
                console.log('saved to db');
                return { contract: newContract, blockNumber: globalBlockNumber };
            });
        } else {
            console.log('contract not found');
            return { contract: null, blockNumber: globalBlockNumber };
        }
    })
}

function verifySource(contract, source, sourceType, compilerVersion) {
    if (sourceType === 'solidity') {
        return compileSolidity(source, compilerVersion).then(function(results) {
            console.log(results);
            results.forEach(function(result) {
                console.log(result);
                for (const contractName in result.compiled.contracts) {
                    const compiledContract = result.compiled.contracts[contractName];
                    console.log(compiledContract);
                    if (compiledContract.bytecode === contract.code) {
                        console.log(compiledContract);
                        return Promise.resolve({
                            contractName: contractName,
                            sourceVersion: result.version
                        });
                    }
                }
            });

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

function compileSolidity(source, compilerVersion) {
    const optPromise = solc.compileOptimized(source, compilerVersion);
    const unoptPromise = solc.compile(source, compilerVersion);

    return Promise.all([optPromise, unoptPromise]);
}

module.exports.lookupContract = lookupContract;
module.exports.verifySource = verifySource;
