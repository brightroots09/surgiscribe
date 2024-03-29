var createError = require('http-errors');
var express = require('express');
var app = express();
// const http = require("http").createServer(app);
// const io = require('socket.io')(http);
// let socket = require('./sockets/socket')(io)
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')
const fileupload = require('express-fileupload')

var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const http = require('http');
const socketIo = require('socket.io');
const port = 3000;
const mysql = require('mysql');
const server = http.createServer(app);
const io = socketIo(server);

const helper = require("./helper/helpers");
const { title } = require('process');

const pool  = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'root',
    password        : '',
    database        : 'surgiscribe'
})





app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(fileupload());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

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
server.listen(port,()=>{
  console.log(`Example app listening on port ${port}`)
})

module.exports = app;