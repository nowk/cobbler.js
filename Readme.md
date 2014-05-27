# Cobbler.js

[![Build Status](https://travis-ci.org/nowk/cobbler.js.svg?branch=master)](https://travis-ci.org/nowk/cobbler.js)
[![Code Climate](https://codeclimate.com/github/nowk/cobbler.js.png)](https://codeclimate.com/github/nowk/cobbler.js)

> A spy who creates false passports, visas, diplomas and other documents

*Mocking Passport OAuth for integration tests*

## Install

    npm install cobbler

## Usage

    var passport = cobbler('passport-github', profile);

    var server = app.listen(7331, function() {
      new WalkingDead(url).zombify(zopts)
        .when(function(browser, next) {
          browser.clickLink('[rel="login-with-github"]', next);
        })
        .then(function(browser) {
          assert.equal(browser.text("title"), "Welcome!");
        })
        .end(function() {
          passport.restore();
          server.close();
          done();
       });
    });

`cobbler` mocks the calls to the OAuth service and redirects you to the *callback url* allowing you to bypass the network connections, but allows you to go through the full (most of it atleast) process without mocking key functions in managing sessions, authenticated or initialization of `passport`.

## Notes

  * [https://github.com/ciaranj/node-oauth/blob/master/lib/oauth2.js#L154](https://github.com/ciaranj/node-oauth/blob/master/lib/oauth2.js#L154)
  * [https://github.com/jaredhanson/passport-oauth2/blob/master/test/oauth2.verify.test.js](https://github.com/jaredhanson/passport-oauth2/blob/master/test/oauth2.verify.test.js)
  * [https://github.com/jaredhanson/passport-oauth2/blob/master/lib/strategy.js#L118](https://github.com/jaredhanson/passport-oauth2/blob/master/lib/strategy.js#L118)
  * [https://github.com/jaredhanson/passport-github/blob/master/lib/strategy.js#L90](https://github.com/jaredhanson/passport-github/blob/master/lib/strategy.js#L90)

## License

MIT

