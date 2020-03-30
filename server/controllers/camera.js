const ffmpeg = require("../util/ffmpeg");
const hash = require("object-hash");

exports.testAPI = (req, res, next) => {
  res.json({ status: "OK" });
};

exports.openCamera = (req, res, next) => {
  let rtspLink = req.body.rtsp;

  if (!rtspLink)
    res.json({ error: "missing rtsp link" });

  let streamKey = hash.sha1(rtspLink);
  // If already existed, plus 1 -> Count connections for each rtsp

  // If stream not existed
  ffmpeg.openUsingScriptFile('./openStream.sh', rtspLink, streamKey);

  // return token if success, else return failure code
  res.json({ token: streamKey });
};
