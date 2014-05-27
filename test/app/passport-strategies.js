/* jshint node: true */

var passport = require('passport');
var GithubStrategy = require('passport-github').Strategy;

/*
 * expose
 */

module.exports = {};

/*
 * github strategy
 */

passport.use(new GithubStrategy({
  clientID: 'clientID',
  clientSecret: 'clientSecret',
  callbackURL: '/auth/github/callback'
}, strategyCallback));

/*
 * github strategy callback
 *
 * @param {String} accessToken
 * @param {String} refreshToken
 * @param {Object} profile
 * @param {Function} done
 * @api private
 */

function strategyCallback(accessToken, refreshToken, profile, done) {
  process.nextTick(function() {
    done(null, {
      id: profile.id,
      name: profile.displayName
    });
  });
}

