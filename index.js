/* jshint node: true */

/*
 * expose
 */

module.exports = cobbler;

// backup originals
cobbler.__ = {};

/*
 * cobbler
 *
 * @param {Stategy|String|Constructor|Prototype} strategy
 * @param {Object} profile
 * @param {Object} opts
 * @api public
 */

function cobbler(strategy, profile, opts) {
  if ('undefined' === typeof profile || null === profile) {
    throw new Error('`profile` must be an object or false');
  }

  opts = opts || {};
  var passauth = !!profile;
  var _proto = proto(strategy);
  override(_proto)
    .method('userProfile', userProfile(profile))
    .method('authenticate', authenticate(passauth, opts));

  this.restore = restore.bind(this, _proto);
  return this;
}

/*
 * backup original methods
 *
 * @param {Prototype} proto
 * @return {Object}
 * @api private
 */

function backup(proto) {
  var method = function(name) {
    cobbler.__[name] = proto[name];
    return this;
  };

  return {
    method: method
  };
}

/*
 * override method
 *
 * @param {Prototype}
 * @return {Object}
 * @api private
 */

function override(proto) {
  var method = function(name, fn) {
    backup(proto).method(name);

    proto[name] = fn;
    return this;
  };

  return {
    method: method
  };
}

/*
 * return the prototype
 *
 * @param {String|Strategy|Prototype} strategy
 * @return {Prototype}
 * @api private
 */

function proto(strategy) {
  if ('string' === typeof strategy) {      // npm name
    strategy = require(strategy).Strategy;
  } else if ('Strategy' in strategy) {     // exports
    strategy = strategy.Strategy;
  }

  // is prototype or get the prototype
  return ('userProfile' in strategy) ? strategy : strategy.prototype;
}

/*
 * restore the original methods
 *
 * @param {Prototype} proto
 * @api private
 */

function restore(proto) {
  var methods = Object.keys(cobbler.__);
  var i = 0;
  var len = methods.length;
  for(; i<len; i++) {
    var name = methods[i];
    proto[name] = cobbler.__[name];
    delete cobbler.__[name];
  }
}

/*
 * Override `authenticate`
 * https://github.com/jaredhanson/passport-oauth2/blob/master/lib/strategy.js#L118
 *
 * We call the original method to allow it to go through the normal process
 * while mocking the OAuth2 object `this._oauth2`
 *
 * @param {Boolean} passauth
 * @param {Object} opts
 * @return {Function}
 * @api private
 */

function authenticate(passauth, opts) {
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
    cobbler.__.authenticate.call(this, req, options);
  };
}

/*
 * Override `userProfile`
 *
 * Unlike the `authenticate` function, this is normally defined in
 * each inheritted strategy. This is other netowkr call out to the internet.
 *
 * @param {Object} profile
 * @return {Function}
 * @api private
 */

function userProfile(profile) {
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

