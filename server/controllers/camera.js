const {body} = require('express-validator');

exports.testAPI = (req, res, next) => {
    res.json({"status":"OK"})
};

/**
 *
 * @param req
 * @param res
 * @param next
 */
exports.openCamera = (req, res, next) => {
    res.json({"status":"OK"})
};