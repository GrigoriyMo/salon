var express = require('express');
var router = express.Router();
var lib = require('../lib/lib');

// GET home page. 
router.get('/', function(req, res, next) {
  var currentWeek = lib.getCurrenWeek();
  currentWeek = lib.translateDays(currentWeek);
  res.render('index', { 
  	currentWeek:currentWeek
  });
});

module.exports = router;