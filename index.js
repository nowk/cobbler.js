/* jshint node: true */

/*
 * expose
 */

module.exports = cobbler;

/*
 * cobbler
 *
 * @param {Stategy|String|Constructor|Prototype} strategy
 * @param {Object} profile
 * @param {Object} opts
 * @constructor
 * @api public
 */

function cobbler(strategy, profile, opts) {
  opts = opts || {};
  var passauth = true;

  if (false === profile) {
    passauth = false;
  } else {
    profile = profile || {};
  }

  // npm name is passed
  if ('string' === typeof strategy) {
    strategy = require(strategy).Strategy;
  }

  // the exports.<StrategyName> is passed
  if ('Strategy' in strategy) {
    strategy = strategy.Strategy;
  }

  var proto = ('userProfile' in strategy) ? strategy : strategy.prototype;

  // override methods
  proto.userProfile = userProfile.call(this, proto, profile);
  proto.authenticate =  authenticate.call(this, proto, passauth, opts);

  /*
   * restore the original methods
   */

  this.restore = (function(_proto, self) {
    return function() {
      _proto.userProfile = self.originalUserProfile;
      _proto.authenticate = self.originalAuthenticate;
    };
  })(proto, this);


  return this; // return
}

/*
 * Override `authenticate`
 * https://github.com/jaredhanson/passport-oauth2/blob/master/lib/strategy.js#L118
 *
 * We call the original method to allow it to go through the normal process
 * while mocking the OAuth2 object `this._oauth2`
 *
 * @param {Prototype} _proto
 * @param {Boolean} passauth
 * @param {Object} opts
 * @return {Function}
 * @api private
 */

function authenticate(_proto, passauth, opts) {
  var self = this;
  var origfn = self.originalAuthenticate = _proto.authenticate;

  /*
   * mock oauth2 object
   *
   * - `getAuthorizeUrl` returns the authorization url
   *   eg. https://github.com/login/oauth/authorize
   *
   *   We want to avoid actually hitting the OAuth endpoint and redirect directly to
   *   the "callback url" w/ any query params corresponding to the status of the req
   *
   *  - `getOAuthAccessToken` retrieves the accessToken used to grab the user profile
   *
   *   This is one of the network calls out to the internet.
   */

  var mockoauth2 = {
    getAuthorizeUrl: function(params) {
      return params.redirect_uri+queryp(passauth, opts);
    },
    getOAuthAccessToken: function(code, params, callback) {
      callback(); // TODO arity and ability to define values for aguments
    }
  };

  return function(req, options) {
    options.callbackURL = opts.callbackURL || options.callbackURL;

    /*
     * you can overwrite the delegator to the inherited `userProfile` method
     * however, `userProfile` is the method calling the actual `oauth2.get()`
     *
     * this._loadUserProfile = function(accessToken, done) {
     *   done(null, user);
     * };
     */

    // TODO do we need to back this up? This is instance based
    this._oauth2 = mockoauth2; // mock the oauth2 object
    origfn.call(this, req, options);
  };
}

/*
 * Override `userProfile`
 *
 * Unlike the `authenticate` function, this is normally defined in
 * each inheritted strategy. This is other netowkr call out to the internet.
 *
 * @param {Prototype} _proto
 * @param {Object} profile
 * @return {Function}
 * @api private
 */

function userProfile(_proto, profile) {
  var origfn = this.originalUserProfile = _proto.userProfile;

  return function(accessToken, done) {
    done(null, profile);
  };
}

/*
 * add callback url query params
 *
 * @param {Boolean} passauth
 * @param {Object} opts
 * @return {String}
 * @api private
 */

function queryp(passauth, opts) {
  return passauth ? '?code=12345' : '?error=access_denied';
}

