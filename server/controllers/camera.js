const hash = require("object-hash");
const debug = require("debug-level").log("server:camera");

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

    debug.info("Stream Key", streamKey);

    if (keyExisted) {
      // Increase key by 1
    } else {
      // Open stream
      let shellFilePath = "./util/openStream.sh";
      setTimeout(
        stream.openUsingScriptFile,
        0,
        shellFilePath,
        rtspLink,
        streamKey
      );

      // return token if success, else return failure code
      res.json({ token: streamKey });
    }
  } catch (err) {
    debug.error("ERROR", err.toString());
    res.json({ error: err.toString() });
  }
};
