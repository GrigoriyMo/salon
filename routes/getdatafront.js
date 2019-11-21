//getdatafront.js
var express = require('express');
var router = express.Router();
var lib = require('../lib/lib');

router.get('/', function(req, res, next) {
	
  var currentWeek = lib.getCurrenWeek();
  currentWeek = lib.translateDays(currentWeek);
  var response = {
  	week:currentWeek.activeDays.thisWeek,
  	time:currentWeek.time,
  	todayDate:(`${currentWeek.todayDay}.${currentWeek.month}`)
  }
  res.send(response);
});

module.exports = router;