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

exports.helper_service_duration_label = function(data) {

}

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
    var currentWeek = new Object();
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

    var nextMonth = function(currentMonth) {
        if (currentMonth[0] === '0') {
            month = (Number(currentMonth) + 1).toString();
            month = `0${month}`;
        } else {
            month = (Number(currentMonth) + 1).toString();
        }
        return month;
    }

    var daysInMonth = new Date(today.getFullYear(), new Date().getMonth() + 1, 0).getDate();
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

    currentWeek.daysInMonth = daysInMonth;
    currentWeek.cutOff = 3;
    currentWeek.time = time(today);
    currentWeek.month = currentMonth(today);
    currentWeek.time_list = [
        "09:30", "10:00",
        "10:30", "11:00",
        "11:30", "12:00",
        "14:30", "15:00",
        "15:30", "16:00",
        "16:30", "17:00",
        "17:30", "18:00",
        "18:30", "19:00",
        "19:30", "20:00",
        "20:30", "21:00"
    ];
    currentWeek.translations = JSON.stringify({
        monday: 'пн',
        tuesday: 'вт',
        wednesday: 'ср',
        thursday: 'чт',
        friday: 'пт',
        saturday: 'сб',
        sunday: 'вс'
    }).replace(/[{}]/g, "").split(",");

    var weekDays = function(todayDay, daysInMonth) {
        var newMonthDay = function() {
            this.day = "01";
            this.dayRequested = false;
            this.getDay = function() {
                this.dayRequested = true;
                return this.day;
            }
            this.nextDay = function() {
                if (this.day[0] === "0") {
                    this.day = ("0" + (Number(this.day) + 1).toString());
                    return this.day;
                } else {
                    this.day = ((Number(this.day) + 1).toString());
                    return this.day;
                }
            }
        };
        var weekDays = new Array();
        var nextMonthDayTemplate = new newMonthDay();

        for (i = 0; i < 8; i++) {
            if (Number(todayDay + i) > Number(daysInMonth)) {
                if (nextMonthDayTemplate.dayRequested) {
                    weekDays.push((nextMonthDayTemplate.nextDay() + "." + nextMonth(currentWeek.month)));
                } else {
                    weekDays.push((nextMonthDayTemplate.getDay() + "." + nextMonth(currentWeek.month)));
                }

            } else if (Number(todayDay + i) === Number(daysInMonth)) {
                weekDays.push((daysInMonth + "." + currentWeek.month));
            } else {
                weekDays.push((todayDay + i + "." + currentWeek.month));
            }
        }
        return weekDays;
    };
    currentWeek.weekDays = weekDays(todayDay, daysInMonth);
    currentWeek.todayDay = todayDay;
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
    var result = db.query(sqlQuery);
    if (result.length > 0) {
        callback({ status: "slot busy" });
    } else {
        callback({ status: "free" });
    }
}

exports.customerRegistration = function(data, callback) {
    checkIfRowExist(data, function(info) {
        if (info.status === 'free') {
            var sqlQuery = `INSERT INTO calendar (date, timeslot, service, customer, created_at) 
			VALUES ('${data.date}', '${data.period}', '${data.service}', '${data.customerName}', now() )`;
            var result = db.query(sqlQuery);
            callback(result);
        } else {
            callback('slot_busy');
        }
    });
}