const router = require('express').Router();

router.get('/check', (req, res, next) => {
    return res.json({message: 'Checking camera'});
});

module.exports = router;