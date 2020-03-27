const router = require('express').Router();

router.use((req, res, next) => {
  return res.json({message: 'hello world'});
});

module.exports = router;