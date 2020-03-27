const router = require('express').Router;

const camera = require('./camera');
const test = require('./test');

// router.use('/test', test);
router.use('/camera', camera);

module.exports = router;