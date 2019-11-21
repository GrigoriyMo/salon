//getbusycalendar.js
var express = require('express');
var router = express.Router();
var lib = require('../lib/lib');

router.get('/', function(req, res, next) {
    var response = lib.get_busy_calendar();
    res.send(response);
});

module.exports = router;