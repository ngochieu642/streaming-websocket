const path = require('path');
const router = require('express').Router();

const cameraController = require('../../controllers/camera');

/* GET /api/camera/check */
router.get("/check", cameraController.testAPI);

/* POST /api/camera/stream/open */
router.post("/stream/open", cameraController.openCamera);

module.exports = router;