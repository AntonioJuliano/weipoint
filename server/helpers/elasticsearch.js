const mongoosastic = require("mongoosastic");
const redis = require('../helpers/redis');
const logger = require('./logger');
const bluebird = require('bluebird');
const redislock = require('redislock');

const ES_REDIS_VERSION_PREFIX = 'es_version_';
const ES_REDIS_SYNCHRONIZED_PREFIX = 'es_synchronized_';

const SYNCHRONIZED = 'SYNCHRONIZED';
const SYNCHRONIZING = 'SYNCHRONIZING';

let config = {
  host: process.env.ELASTICSEARCH_URL,
  port: process.env.ELASTICSEARCH_PORT,
  auth: process.env.ELASTICSEARCH_LOGIN,
  protocol: "https"
};

function plugin(schema, versionNumber, schemaName) {
  config.index = schemaName + '_' + versionNumber;
  schema.plugin(
    mongoosastic,
    config
  );
}

async function connect(model, versionNumber, schemaName) {
  const version_lock = redislock.createLock(redis,  {
    timeout: 5000,
    retries: 3,
    delay: 100
  });
  const synchronized_lock = redislock.createLock(redis,  {
    timeout: 20000,
    retries: 3,
    delay: 1000
  });

  try {
    await version_lock.acquire(ES_REDIS_VERSION_PREFIX + '_lock_' + schemaName);
    const schemaVersion = await redis.getAsync(ES_REDIS_VERSION_PREFIX + schemaName);
    if (parseInt(schemaVersion) !== versionNumber) {
      await model.createMappingAsync();

      logger.info({
        at: 'Elasticsearch#connect',
        message: 'Created elasticsearch mapping',
        name: schemaName,
        version: versionNumber
      });

      logger.info({
        at: 'Elasticsearch#connect',
        message: 'Synchronizing to new index...',
        name: schemaName,
        version: versionNumber
      });

      const multi = redis.multi();
      bluebird.promisifyAll(multi);
      multi.set(ES_REDIS_VERSION_PREFIX + schemaName, versionNumber)
      multi.set(ES_REDIS_SYNCHRONIZED_PREFIX + schemaName, SYNCHRONIZING)
      await multi.execAsync();
    } else {
      version_lock.release(ES_REDIS_VERSION_PREFIX + '_lock_' + schemaName)
        .catch(function(_err){});
    }
  } catch (err) {
    logger.error({
      at: 'Elasticsearch#connect',
      message: 'Creating elasticsearch mapping threw error',
      error: err.toString(),
      name: schemaName,
      version: versionNumber
    });
    setTimeout(() => {
      connect( model, versionNumber, schemaName)
    }, 1000);
    version_lock.release(ES_REDIS_VERSION_PREFIX + '_lock_' + schemaName)
      .catch(function(_err){});
    return;
  }

  try {
    await synchronized_lock.acquire(ES_REDIS_SYNCHRONIZED_PREFIX + '_lock_' + schemaName);
    const synchronized = await redis.getAsync(ES_REDIS_SYNCHRONIZED_PREFIX + schemaName);
    if (synchronized !== SYNCHRONIZED) {
      const stream = model.synchronize();
      let count = 0;

      stream.on('data', async function(_err, _doc){
        count++;
        if (count % 100 === 0) {
          logger.info({
            at: 'Elasticsearch#connect',
            message: 'Synchronized documents to new index',
            name: schemaName,
            version: versionNumber,
            count: count
          });
          try {
            await synchronized_lock.extend(
              ES_REDIS_SYNCHRONIZED_PREFIX + '_lock_' + schemaName
            );
          } catch (err) {
            logger.error({
              at: 'Elasticsearch#connect',
              message: 'Error thrown while extending lock',
              error: err.toString(),
              name: schemaName,
              version: versionNumber
            });
          }
        }
      });

      stream.on('close', function() {
        logger.info({
          at: 'Elasticsearch#connect',
          message: 'Finished synchronizing documents to new index',
          name: schemaName,
          version: versionNumber,
          count: count
        });
        synchronized_lock.release(ES_REDIS_SYNCHRONIZED_PREFIX + '_lock_' + schemaName);
        redis.setAsync(ES_REDIS_SYNCHRONIZED_PREFIX + schemaName, SYNCHRONIZED);
        // TODO remove the old index
      });

      stream.on('error', function(err){
        logger.error({
          at: 'Elasticsearch#connect',
          message: 'Error thrown while synchronizing documents',
          name: schemaName,
          version: versionNumber,
          count: count,
          error: err.toString()
        });
        synchronized_lock.release(ES_REDIS_SYNCHRONIZED_PREFIX + '_lock_' + schemaName);
        setTimeout(() => {
          connect( model, versionNumber, schemaName)
        }, 1000);
      });
    } else {
      synchronized_lock.release(ES_REDIS_SYNCHRONIZED_PREFIX + '_lock_' + schemaName);
    }
  } catch (err) {
    logger.error({
      at: 'Elasticsearch#connect',
      message: 'Error thrown while initializing sync',
      name: schemaName,
      version: versionNumber,
      error: err.toString()
    });
    synchronized_lock.release(ES_REDIS_SYNCHRONIZED_PREFIX + '_lock_' + schemaName)
      .catch(function(_err){});
    setTimeout(() => {
      connect( model, versionNumber, schemaName)
    }, 1000);
  }
}

module.exports.plugin = plugin;
module.exports.connect = connect;
