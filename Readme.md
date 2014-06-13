# Cobbler.js

[![Build Status](https://travis-ci.org/nowk/cobbler.js.svg?branch=master)](https://travis-ci.org/nowk/cobbler.js)
[![Code Climate](https://codeclimate.com/github/nowk/cobbler.js.png)](https://codeclimate.com/github/nowk/cobbler.js)
[![David DM](https://david-dm.org/nowk/cobbler.js.png)](https://david-dm.org/nowk/cobbler.js)

> A spy who creates false passports, visas, diplomas and other documents

*Mocking Passport OAuth for integration tests*

## Install

    npm install cobbler --save-dev

## Usage

#### Stratgies

    var passport = cobbler('passport-github', {..profile..});

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

`cobbler` mocks the calls to the OAuth service and redirects you to the *callback url* allowing you to bypass the network connections, but allows you to go through the full (most of it at least) process without mocking key functions in managing sessions, authenticated or initialization of `passport`.

---

If you want to simulate a successful authentication, the "profile" argument should be an object similar to what you would receive from an OAuth `userProfile` call. This will hit your Strategy callback and go through the normal chain of events.

    var passport = cobbler('passport-github', {
      provider: 'github',
      id: 12345,
      displayName: 'John Doe'
    });

To simulate a failed authentication, the "profile" argument should be `false`.

    var passport = cobbler('passport-github', false);


#### Login Session

`cobbler` provides a way to "login as a user" without actually going through the actual login (above).

    var passport = cobbler('session', '12345');

Note the first agrument string *'session'* (**case-sensitive**). The 2nd argument should be the object that is passed to the `passport.deserializeUser` method. ex.

    passport.deserializeUser(function(id, done) {
      User.findOne({_id: id})
        .exec(function(err, resource) {
          if (err) {
            return done(err, null);
          }
          done(null, resource);
        });
    });

`id` would be a `user.id`.

---

*Your `passport.deserializeUser` will actually be invoked*

#### Restoring

You can restore the old functions by calling `restore()`.

    var passport = cobbler('passport-github', {..profile..});

    // do the test

    passport.restore();

## API

`cobbler`, *for stratgies*, can be passed either the npm name eg. '*passport-github*' or the exports eg. `var passportGithub = require('passport-github');` or the strategy eg. `var GithubStrategy = require('passport-github').Strategy;`

*For sessions*, the first argument must be "session".

---

It should be noted that you may need to clear the `require.cache` of your `app` between tests.

## Notes

  * [https://github.com/ciaranj/node-oauth/blob/master/lib/oauth2.js#L154](https://github.com/ciaranj/node-oauth/blob/master/lib/oauth2.js#L154)
  * [https://github.com/jaredhanson/passport-oauth2/blob/master/test/oauth2.verify.test.js](https://github.com/jaredhanson/passport-oauth2/blob/master/test/oauth2.verify.test.js)
  * [https://github.com/jaredhanson/passport-oauth2/blob/master/lib/strategy.js#L118](https://github.com/jaredhanson/passport-oauth2/blob/master/lib/strategy.js#L118)
  * [https://github.com/jaredhanson/passport-github/blob/master/lib/strategy.js#L90](https://github.com/jaredhanson/passport-github/blob/master/lib/strategy.js#L90)

## TODO

  * More test coverage for other Passport OAuth Strategies (only Github at this point)
  * Ability to set arguments such as `accessToken, refreshToken, params`
  * Ability to test `fail` and `error` calls.
  * Ability to set `callback url` `code` and `error` query params

## License

MIT

