var express = require('express');
var router = express.Router();
var lib = require('../lib/lib');

router.post('/', function(req, res, next) {
    var data = req.body;
    data.service_translation = lib.helper_service_translations(data);
    data.time_labels = lib.helper_service_duration_label(lib.getCurrenWeek().time_list);
    console.log(data);
    lib.customerRegistration(data, function(result) {
        if (result !== 'slot_busy') {
            res.render('regcomplete', { data });
        } else {
            res.send(result);
        }
    });
});

module.exports = router;