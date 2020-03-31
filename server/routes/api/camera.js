const path = require("path");
const { body } = require("express-validator");
const router = require("express").Router();

const cameraController = require("../../controllers/camera");

/* GET /api/camera/check */
router.get("/check", cameraController.testAPI);

/* POST /api/camera/stream/open
 *  This receives an rtsp link and a token
 *  In this version, token will not be checked.
 *  However, it is necessary in the future to have it checked.
 *  Because we will only provide stream for Users in SIP
 *  Moreover, a user can not watch other streams.
 * */
const streamOpenValidators = [
  body("rtsp")
    .not()
    .isEmpty()
    .escape(),
  body("token")
    .not()
    .isEmpty()
    .escape(),
  body("notifyOnReply").toBoolean()
];

router.post(
  "/stream/open",
  // streamOpenValidators,
  cameraController.openCamera
);

module.exports = router;
