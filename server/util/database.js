const redis = require("redis");
const client = redis.createClient({ host: "192.168.100.11", port: 63790 });
const debugDatabase = require("debug-level").log("server:database");

exports.DatabaseClient = client;

client.on("connect", function() {
  debugDatabase.info("Redis Client connected");
});

client.on("close", function() {
  debugDatabase.info(`Redis Client ${client} disconnected`);
});

exports.KeyExisted = (redisClient, keyToCheck) => {
  return new Promise((resolve, reject) => {
    redisClient.exists(keyToCheck, (err, reply) => {
      if (err) {
        reject(err);
        return;
      }
      if (reply === 1) resolve(true);
      else resolve(false);
    });
  });
};

exports.IncreaseKeyBy1 = (redisClient, keyToIncrease) => {};

exports.DecreaseKeyBy1 = (redisClient, keyToDecrease) => {};
