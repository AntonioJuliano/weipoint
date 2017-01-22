/**
 * Created by antonio on 1/18/17.
 */

const Contract = require('../models/contract');
const web3 = require('../helpers/web3');

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

module.exports.lookupContract = lookupContract;