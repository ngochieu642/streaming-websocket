const path = require('path');
const router = require('express').Router();

const cameraController = require('../../controllers/camera');

// /api/camera/check
router.get("/check", cameraController.testAPI);

module.exports = router;