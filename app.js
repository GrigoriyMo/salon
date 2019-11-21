var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var registrationRouter = require('./routes/registration');
var getDataFront = require('./routes/getdatafront');
var getBusyCalendar = require('./routes/getbusycalendar');
var lib = require('./lib/lib').getCurrenWeek();
console.log(lib);

var app = express();

var myLogger = function(req, res, next) {
    console.log('LOGGED');
    next();
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(myLogger);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/uploads'));
app.use(express.static(__dirname + '/files'));
app.use('/', indexRouter);
app.use('/registration', registrationRouter);
app.use('/getdatafront', getDataFront);
app.use('/getbusycalendar', getBusyCalendar);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;