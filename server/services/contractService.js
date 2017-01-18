/**
 * Created by antonio on 1/18/17.
 */

const Contract = require('../models/contract');
const web3 = require('../helpers/web3');

function lookupContract(address) {
    const dbPromise = Contract.findOne({ address: address }).exec();
    const web3Promise = web3.eth.getCodeAsync(address);

    return Promise.all([dbPromise, web3Promise]).then(function(results) {
        const dbResult = results[0];
        const web3Result = results[1];

        if (dbResult !== null) {
            console.log('found from database');
            return dbResult;
        } else if (web3Result !== null) {
            console.log('found from web3');

            const newContract = new Contract({ address: address, code: web3Result });
            return newContract.save().then(function(result) {
                console.log('saved to db');
                return newContract;
            });
        } else {
            return null;
        }
    })
}

module.exports.lookupContract = lookupContract;