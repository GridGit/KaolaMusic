var express = require('express');
var router = express.Router();
var path = require("path");
var media = path.join(__dirname,"");

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
