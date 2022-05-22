var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
require('dotenv').config();
const passport = require('passport');
require('./modules/passport');
//establishing the connection  between the app and the server
mongoose.connect('mongodb://127.0.0.1:27017/expenseTracker', (err) => {
  console.log(err ? err : 'Connection is made sucessfully');
});

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const dashboard = require('./routes/dashboard');
const auth = require('./middlewares/auth');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  require('node-sass-middleware')({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true,
    sourceMap: true,
  })
);

// session middelware
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);
app.use(passport.initialize());
app.use(passport.session());

//user information   middelware
app.use(auth.userInformation);
// app.use(auth.userIsVerified);
// all the routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/dashboard', dashboard);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
