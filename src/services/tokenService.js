const Contract = require('../models/contract');
const contractService = require('./contractService');
const LRU = require("lru-cache");
const logger = require('../helpers/logger');

const cache = LRU({ maxAge: 1000 * 60 * 60 });
const TOKEN_CONTRACTS_KEY = 'token_contracts';

async function getBalances(address) {
  const tokens = await getTokens();

  const balances = await Promise.all(tokens.map( async (t) => {
    try {
      const balance = await contractService.callConstantFunction(t, 'balanceOf', [address]);

      let symbol = cache.get(t.address + '_symbol');
      let decimals = cache.get(t.address + '_decimals');

      if (!symbol) {
        symbol = await contractService.callConstantFunction(t, 'symbol', []);
        cache.set(t.address + '_symbol', symbol);
      }
      if (!decimals) {
        decimals = parseInt(await contractService.callConstantFunction(t, 'decimals', []));
        cache.set(t.address + '_decimals', decimals);
      }

      return {
        balance: balance,
        symbol: symbol,
        decimals: decimals
      };
    } catch(e) {
      logger.error({
        at: 'tokenService#getBalances',
        message: 'Failed to get token balance',
        tokenAddress: t.address,
        address: address,
        error: e.toString()
      });
      return {
        balance: 0
      }
    }
  }));

  const nonZeroBalances = balances.filter( b => b.balance > 0);

  return nonZeroBalances;
}

async function getTokens() {
  const cachedTokenContracts = cache.get(TOKEN_CONTRACTS_KEY);

  if (cachedTokenContracts) {
    return cachedTokenContracts;
  }

  const tokens = await Contract.find({ isToken: true }).exec();
  cache.set(TOKEN_CONTRACTS_KEY, tokens);
  return tokens;
}

module.exports.getBalances = getBalances;
module.exports.getTokens = getTokens;
