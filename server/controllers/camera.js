const hash = require("object-hash");
const { DEBUG_CAMERA: debugCamera } = require("../util/constants").DEBUG;

const stream = require("../util/stream");
const database = require("../util/database");

exports.testAPI = (req, res, next) => {
  res.json({ status: "OK" });
};

exports.openCamera = async (req, res, next) => {
  let rtspLink = req.body.rtsp;

  if (!rtspLink) res.json({ error: "missing rtsp link" });

  let streamKey = hash.sha1(rtspLink);

  // If already existed, plus 1 -> Count connections for each rtsp
  try {
    let keyExisted = await database.KeyExisted(
      database.DatabaseClient,
      streamKey
    );

    debugCamera.info("Stream Key", streamKey);

    if (keyExisted) {
      // Increase key by 1
      debugCamera.info('Stream already existed');
      res.json({ token: streamKey });
    } else {
      debugCamera.info('Stream not open yet');

      // Open stream
      let shellFilePath = "./util/openStream.sh";
      setTimeout(
        stream.openUsingScriptFile,
        0,
        shellFilePath,
        rtspLink,
        streamKey
      );

      // Initialize Key in redis
      database.InitializeKey(database.DatabaseClient, streamKey);

      // return token if success, else return failure code
      res.json({ token: streamKey });
    }
  } catch (err) {
    debugCamera.error("ERROR", err.toString());
    res.json({ error: err.toString() });
  }
};
