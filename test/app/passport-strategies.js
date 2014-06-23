/* jshint node: true */

var passport = require('passport');
var GithubStrategy = require('passport-github').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;

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
 * linkedin strategy
 */

passport.use(new LinkedInStrategy({
  clientID: 'clientID',
  clientSecret: 'clientSecret',
  callbackURL: '/auth/linkedin/callback',
  scope: ['r_fullprofile', 'r_emailaddress', 'r_network']
}, strategyCallback));

/*
 * google strategy
 */

passport.use(new GoogleStrategy({
  clientID: 'clientID',
  clientSecret: 'clientSecret',
  callbackURL: '/auth/google/callback'
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
      name: profile.name || profile.displayName
    });
  });
}

