const Client = require('coinbase').Client;
const client = new Client({
  'apiKey': 'API KEY',
  'apiSecret': 'API SECRET'
});
const bluebirdPromise = require('bluebird');
const logger = require('../helpers/logger');

let price = null;

bluebirdPromise.promisifyAll(client);

function getPrice() {
  return price;
}

async function _fetchPrice() {
  // logger.info({
  //   at: 'coinbase#_fetchPrice',
  //   message: 'Fetching price...'
  // });
  try {
    const response = await client.getSpotPriceAsync({'currencyPair': 'ETH-USD'});
    price = parseFloat(response.data.amount);
  } catch (e) {
    logger.error({
      at: 'coinbase#_fetchPrice',
      message: 'Fetching price threw error',
      error: e.toString()
    });
  }
  // logger.info({
  //   at: 'coinbase#_fetchPrice',
  //   message: 'Price set',
  //   price: price
  // });
  setTimeout(_fetchPrice, 10000);
}

_fetchPrice();

module.exports.getPrice = getPrice;
