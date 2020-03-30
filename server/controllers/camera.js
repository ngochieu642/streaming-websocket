exports.testAPI = (req, res, next) => {
    res.json({"status":"OK"})
};

exports.openCamera = (req, res, next) => {
    console.log(req.body);
    // hash the rtsp -> token

    // Use node process to open a stream with above token

    // If rtsp not existed in redis, write value {rtsp-link :1}
    // If already existed, plus 1 -> Count connections for each rtsp

    // return token if success, else return failure code
    res.json({"status":"OK Post"})
};