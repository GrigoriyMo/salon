var express = require('express');
var router = express.Router();
var lib = require('../lib/lib');

router.post('/', function(req, res, next) {
  var data = req.body;
  lib.customerRegistration(data,function(result){
    console.log('registrate');
    console.log(JSON.stringify(req.body));
    if(result!=='slot_busy'){
    	res.send('registration_completed');
    }else{
    	res.send('slot_busy');
    }
  });
});

module.exports = router;