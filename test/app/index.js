/* jshint node: true */

var express = require('express');
var _MiddleEarth = require('middle-earth');
var passport = require('passport');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');

/*
 * passport serlializers
 */

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

/*
 * passport strategies
 */

require('./passport-strategies');

/*
 * app
 */

var app = module.exports = express();
var routes = require('./routes');

// middlewares
app.middlewares([
  {name: 'body-parser', cb: bodyParser()},
  {name: 'cookie-parser', cb: cookieParser('secret')},
  {name: 'sessions', cb: session({secret: 'secret'})},
  {name: 'passport-init', cb: passport.initialize()},
  {name: 'passport-session', cb: passport.session()},
  {name: 'routes', fn: routes.bind(app)}
]);

/*
 * listen
 */

app.listen = (function() {
  var app = this;
  var _listen = this.listen;
  return function(port, callback) {
    app
      .middlewares()
      .finish();

    return _listen.call(app, port, callback);
  };
}).call(app);

