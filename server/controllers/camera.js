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

  let streamKey = await stream.getStreamKey(rtspLink);

  try {
    let keyExisted = await database.KeyExisted(
      database.DatabaseClient,
      streamKey
    );

    if (keyExisted) {
      debugCamera.info("Stream already existed");
      res.json({ token: await stream.getWebSocketLink(rtspLink) });
    } else {
      debugCamera.info("Stream not open yet");

      // Open stream
      let shellFilePath = "./util/openStream.sh";
      let websocketLink = await stream.openUsingScriptFile(
        shellFilePath,
        rtspLink
      );
      debugCamera.info(`Stream Link: ${websocketLink}`);

      // Initialize Key in redis
      await database.InitializeKey(database.DatabaseClient, streamKey);

      // return token if success, else return failure code
      res.json({ stream: websocketLink });
    }
  } catch (err) {
    debugCamera.error("ERROR", err.toString());
    res.json({ error: err.toString() });
  }
};
