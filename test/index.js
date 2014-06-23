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
  var linkedinProfile = {
    provider: 'linkedin',
    id: 54321,
    displayName: 'John Doe',
    emailAddress: 'john@doe.com'
  };

  var googleProfile = {
    provider: 'google',
    id: 'abcdef',
    displayName: 'John Doe',
    email: 'john@doe.com'
  };

  var app;
  beforeEach(function() {
    delete require.cache[require.resolve('./app')];
    app = require('./app');
  });

  describe('strategies', function() {
    var passport, server;
    afterEach(function(done) {
      passport.restore();
      server.close(done);
    });

    it("success w/ the supplied profile and github strategy", function(done) {
      passport = cobbler('passport-github', profile);
      server = app.listen(7331, function() {
        new WalkingDead(url).zombify(zopts)
          .when(loginWithgithub)
          .then(assertSuccessfullogin)
          .end(done);
      });
    });

    it("success w/ the supplied profile and linkedin strategy", function(done) {
      passport = cobbler('passport-linkedin-oauth2', linkedinProfile);
      server = app.listen(7331, function() {
        new WalkingDead(url).zombify(zopts)
          .when(loginWithLinkedin)
          .then(assertSuccessfullogin)
          .end(done);
      });
    });

    it("defines a custom callbackURL", function(done) {
      passport = cobbler('passport-github', profile, {
        callbackURL: 'http://localhost:7331/auth/github/callback-2'
      });
      server = app.listen(7331, function() {
        new WalkingDead(url).zombify(zopts)
          .when(loginWithgithub)
          .then(function(browser) {
            assert.equal(browser.text("title"), "Welcome Other!");
            assert.equal(browser.text("h1"), "Uh... John Doe!");
          })
          .end(done);
      });
    });

    it("access denied", function(done) {
      passport = cobbler("passport-github", false);
      server = app.listen(7331, function() {
        new WalkingDead(url).zombify(zopts)
          .when(loginWithgithub)
          .then(function(browser) {
            assert.equal(browser.text("title"), "Bad!");
          })
          .end(done);
      });
    });

    it("can be passed the Github Strategy", function(done) {
      var strategy = require('passport-github').Strategy;
      passport = cobbler(strategy, profile);
      server = app.listen(7331, function() {
        new WalkingDead(url).zombify(zopts)
          .when(loginWithgithub)
          .then(assertSuccessfullogin)
          .end(done);
      });
    });

    it("can be passed the Google Strategy", function(done) {
      var strategy = require('passport-google-oauth').OAuth2Strategy;
      passport = cobbler(strategy, profile);
      server = app.listen(7331, function() {
        new WalkingDead(url).zombify(zopts)
          .when(loginWithGoogle)
          .then(assertSuccessfullogin)
          .end(done);
      });
    });

    it("can be passed the prototype object of the strategy", function(done) {
      var proto = require('passport-github').Strategy.prototype;
      passport = cobbler(proto, profile);
      server = app.listen(7331, function() {
        new WalkingDead(url).zombify(zopts)
          .when(loginWithgithub)
          .then(assertSuccessfullogin)
          .end(done);
      });
    });
  });

  describe('sessions', function() {
    var session, server;
    afterEach(function(done) {
      session.restore();
      server.close(done);
    });

    it("logs you in as", function(done) {
      var deserializeUser = {
        id: profile.id,
        name: profile.displayName
      };

      session = cobbler('session', deserializeUser);
      server = app.listen(7331, function() {
        new WalkingDead(url).zombify(zopts)
          .then(assertSuccessfullogin)
          .end(done);
      });
    });
  });

  it("throws if profile is null or undefined", function() {
    assert.throws(function() {
      cobbler('passport-github');
    }, '`profile` must be an object or false');

    assert.throws(function() {
      cobbler('passport-github', null);
    }, '`profile` must be an object or false');
  });
});

/*
 * click github login
 */

function loginWithgithub(browser, next) {
  browser.clickLink('[rel="login-with-github"]', next);
}

/*
 * click linkedin login
 */

function loginWithLinkedin(browser, next) {
  browser.clickLink('[rel="login-with-linkedin"]', next);
}

/*
 * click google login
 */

function loginWithGoogle(browser, next) {
  browser.clickLink('[rel="login-with-google"]', next);
}

/*
 * assert successful login
 */

function assertSuccessfullogin(browser) {
  assert.equal(browser.text("title"), "Welcome!");
  assert.equal(browser.text("h1"), "Hello John Doe!");
}

