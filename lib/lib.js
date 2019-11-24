//lib.js
var mysql = require('sync-mysql');
var conf = require('./conf').options;
global.db = new mysql({
    host: conf.host,
    user: conf.user,
    password: conf.password,
    database: conf.database
});

var db = global.db;

exports.helper_service_translations = function(data) {
    translations = [
        { rus: "Маникюр", system: "manikur" },
        { rus: "Маникюр с покрытием", system: "manikurCover" },
        { rus: "Маникюр с дизайном", system: "manikurDesign" },
        { rus: "Маникюр + педикюр", system: "manikurPedikur" },
        { rus: "Педикюр", system: "pedikur" }
    ];
    var translate = function(data) {
        var translation;
        translations.map(function(obj) {
            if (obj.system === data.service) {
                translation = new String(obj.rus);
            }
        });
        return (translation);
    }

    return translate(data);
}

exports.get_busy_calendar = function() {
    var sqlQuery = `SELECT date,timeslot from calendar`;
    var busy_calendar = db.query(sqlQuery);
    for (elem in busy_calendar) {
        busy_calendar[elem].timeslot = busy_calendar[elem].timeslot.split(',');
    }
    return busy_calendar;
}

exports.getCurrenWeek = function() {
    var today = new Date();
    var time = function(today) {
        var hour = today.getHours();
        var minute = today.getMinutes();
        if (hour.toString().length === 1) {
            hour = `0${hour}`;
        }
        if (minute.toString().length === 1) {
            minute = `0${minute}`;
        }
        var time = `${hour}:${minute}`;
        return time;
    };
    var dayOfWeek = today.getDay();
    var todayDay = today.getDate();
    var currentMonth = function(today) {
        var month = today.getMonth() + 1;
        if (month.toString().length === 1) {
            month = `0${month}`;
        }
        return month;
    }
    var daysInMonth = new Date(today.getFullYear(), new Date().getMonth() + 1, 0).getDate();
    var currentWeek = new Object();
    switch (dayOfWeek) {
        case 0:
            currentWeek = {
                dayOfWeek: 'sunday',
                activeDays: {
                    thisWeek: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
                    nextWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
                }
            };
            break;
        case 1:
            currentWeek = {
                dayOfWeek: 'monday',
                activeDays: {
                    thisWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'monday'],
                    nextWeek: ['monday']
                }
            };
            break;
        case 2:
            currentWeek = {
                dayOfWeek: 'tuesday',
                activeDays: {
                    thisWeek: ['tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'monday', 'tuesday'],
                    nextWeek: ['monday', 'tuesday']
                }
            };
            break;
        case 3:
            currentWeek = {
                dayOfWeek: 'wednesday',
                activeDays: {
                    thisWeek: ['wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'monday', 'tuesday', 'wednesday'],
                    nextWeek: ['monday', 'tuesday', 'wednesday']
                }
            };
            break;
        case 4:
            currentWeek = {
                dayOfWeek: 'thursday',
                activeDays: {
                    thisWeek: ['thursday', 'friday', 'saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
                    nextWeek: ['monday', 'tuesday', 'wednesday', 'thursday']
                }
            };
            break;
        case 5:
            currentWeek = {
                dayOfWeek: 'friday',
                activeDays: {
                    thisWeek: ['friday', 'saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
                    nextWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
                }
            };
            break;
        case 6:
            currentWeek = {
                dayOfWeek: 'saturday',
                activeDays: {
                    thisWeek: ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
                    nextWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
                }
            };
            break;
    }
    currentWeek.todayDay = todayDay;
    currentWeek.daysInMonth = daysInMonth;
    currentWeek.cutOff = 3;
    currentWeek.time = time(today);
    currentWeek.month = currentMonth(today);
    currentWeek.time_list = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"];
    currentWeek.translations = JSON.stringify({
        monday: 'пн',
        tuesday: 'вт',
        wednesday: 'ср',
        thursday: 'чт',
        friday: 'пт',
        saturday: 'сб',
        sunday: 'вс'
    }).replace(/[{}]/g, "").split(",");
    //console.log(currentWeek);
    return currentWeek;
}

exports.translateDays = function(obj) {
    var dictionary = obj.translations;
    var days = obj.activeDays.thisWeek;
    var translatedDays = new Array();
    for (i in days) {
        for (key in dictionary) {
            if (dictionary[key].search(days[i]) !== (-1)) {
                translatedDays.push(dictionary[key].substr(-3).replace(`"`, ""));
                break;
            }
        }
    };
    obj.translatedDays = translatedDays;
    return obj;
}

function checkIfRowExist(data, callback) {
    var sqlQuery = `SELECT * FROM calendar where date = '${data.date}' and timeslot = '${data.period}'`;
    //console.log(sqlQuery);
    var result = db.query(sqlQuery);
    if (result.length > 0) {
        callback({ status: "slot busy" });
    } else {
        callback({ status: "free" });
    }
}

exports.customerRegistration = function(data, callback) {
    //console.log(data);
    checkIfRowExist(data, function(info) {
        if (info.status === 'free') {
            var sqlQuery = `INSERT INTO calendar (date, timeslot, service, customer, created_at) 
			VALUES ('${data.date}', '${data.period}', '${data.service}', '${data.customerName}', now() )`;
            //console.log(sqlQuery);
            var result = db.query(sqlQuery);
            //console.log(result);
            callback(result);
        } else {
            callback('slot_busy');
        }
    });
}