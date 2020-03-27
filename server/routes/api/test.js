const router = require('express').Router();

router.get("/sample", (req, res, next) => {
  return res.json({message: 'hello world dude'});
});

module.exports = router;