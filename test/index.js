/* jshint node: true */

var assert = require('chai').assert;
var WalkingDead = require('walking-dead');
var cobbler = require('..');

describe('cobbler', function() {
  this._timeout = 99999;
  var zopts = {debug: false, silent: false};
  var url = 'http://localhost:7331';

  var profile = {
    provider: 'github',
    id: 12345,
    displayName: 'John Doe',
    emails: [{value: 'john@doe.com'}]
  };

  var app;

  beforeEach(function(done) {
    delete require.cache[require.resolve('./app')];
    app = require('./app');
    done();
  });

  it("success w/ the supplied profile", function(done) {
    var passport = cobbler('passport-github', profile);

    var server = app.listen(7331, function() {
      new WalkingDead(url).zombify(zopts)
        .when(function(browser, next) {
          browser.clickLink('[rel="login-with-github"]', next);
        })
        .then(function(browser) {
          assert.equal(browser.text("title"), "Welcome!");
          assert.equal(browser.text("h1"), "Hello John Doe!");
        })
        .end(function() {
          passport.restore();
          server.close();
          done();
       });
    });
  });

  it("defines a custom callbackURL", function(done) {
    var passport = cobbler('passport-github', profile, {
      callbackURL: 'http://localhost:7331/auth/github/callback-2'
    });

    var server = app.listen(7331, function() {
      new WalkingDead(url).zombify(zopts)
        .when(function(browser, next) {
          browser.clickLink('[rel="login-with-github"]', next);
        })
        .then(function(browser) {
          assert.equal(browser.text("title"), "Welcome Other!");
          assert.equal(browser.text("h1"), "Uh... John Doe!");
        })
        .end(function() {
          passport.restore();
          server.close();
          done();
       });
    });
  });

  it("access denied", function(done) {
    var passport = cobbler("passport-github", false);

    var server = app.listen(7331, function() {
      new WalkingDead(url).zombify(zopts)
        .when(function(browser, next) {
          browser.clickLink('[rel="login-with-github"]', next);
        })
        .then(function(browser) {
          assert.equal(browser.text("title"), "Bad!");
        })
        .end(function() {
          passport.restore();
          server.close();
          done();
       });
    });
  });

  it("can be passed the prototype object of the strategy", function(done) {
    var passportGithub = require('passport-github');
    var passport = cobbler(passportGithub.Strategy.prototype, profile);

    var server = app.listen(7331, function() {
      new WalkingDead(url).zombify(zopts)
        .when(function(browser, next) {
          browser.clickLink('[rel="login-with-github"]', next);
        })
        .then(function(browser) {
          assert.equal(browser.text("title"), "Welcome!");
          assert.equal(browser.text("h1"), "Hello John Doe!");
        })
        .end(function() {
          passport.restore();
          server.close();
          done();
       });
    });
  });
});
