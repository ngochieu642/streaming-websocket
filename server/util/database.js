const redis = require("redis");
const client = redis.createClient({ host: "192.168.100.11", port: 63790 });
const { DEBUG_DATABASE: debugDatabase } = require("../util/constants").DEBUG;

exports.DatabaseClient = client;

client.on("connect", function() {
  debugDatabase.info("Redis Client connected");
});

client.on("ready", function() {
  debugDatabase.info("Redis Client ready");
});

client.on("close", function() {
  debugDatabase.info(`Redis Client ${client} disconnected`);
});

exports.CountConnections = (redisClient, keyToCheck) => {
  return new Promise((resolve, reject) => {
    redisClient.get(keyToCheck, (err, res) => {
      if (err) reject(err);
      if (!redisClient.ready) reject("Client not ready");
      resolve(res);
    });
  });
};

exports.KeyExisted = (redisClient, keyToCheck) => {
  return new Promise((resolve, reject) => {
    redisClient.exists(keyToCheck, (err, reply) => {
      if (err) {
        reject(err);
      }
      if (reply === 1) resolve(true);
      else resolve(false);
    });
  });
};

exports.InitializeKey = (redisClient, keyToInitialize) => {
  debugDatabase.info(
    `Client: Connected to Server at ${redisClient.connection_options.host}:${redisClient.connection_options.port}`
  );
  return new Promise((resolve, reject) => {
    if (!redisClient.ready) {
      reject("Client not ready");
    }
    redisClient.set(keyToInitialize, 0, function(err, res) {
      debugDatabase.info(res);
      if (err) reject(err);
      resolve(res);
    });
  });
};

exports.IncreaseKeyBy1 = (redisClient, keyToIncrease) => {
  return new Promise((resolve, reject) => {
    redisClient.get(keyToIncrease, function(err, value) {
      if (err) {
        debugDatabase.err(`Error in database.js: ${err.toString()}`);
        reject(err);
      }

      redisClient.incr(keyToIncrease, function(err, res) {
        if (err) {
          debugDatabase.error(`Error in database.js`);
          reject(err);
        }

        resolve(res);
      });
    });
  });
};

exports.DecreaseKeyBy1 = (redisClient, keyToDecrease) => {
  return new Promise((resolve, reject) => {
    redisClient.get(keyToDecrease, function(err, value) {
      if (err) {
        debugDatabase.err(`Error in database.js: ${err.toString()}`);
        reject(err);
      }

      redisClient.decr(keyToDecrease, function(err, res) {
        if (err) {
          debugDatabase.error(`Error in database.js`);
          reject(err);
        }

        resolve(res);
      });
    });
  });
};
