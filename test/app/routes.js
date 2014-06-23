/* jshint node: true */

var passport = require('passport');

/*
 * routes
 */

module.exports = function() {
  var app = this;

  app.get("/",
    ensureAuthenticated(),
    function(req, res, next) {
      var user = req.user;
      var html = "<html>" +
      "<head><title>Welcome!</title></head>" +
      "<body><h1>Hello "+user.name+"!</h1></body>" +
      "</html>";
      res.send(html);
    });

  app.get("/login", function(req, res, next) {
    var html = "<html>" +
    "<head><title>Login</title></head><body>" +
    "<a href=\"/auth/github\" rel=\"login-with-github\">Login with github</a>" +
    "<a href=\"/auth/linkedin\" rel=\"login-with-linkedin\">Login with linkedin</a>" +
    "<a href=\"/auth/google\" rel=\"login-with-google\">Login with google</a>" + 
    "</body></html>";
    res.send(html);
  });

  app.get("/auth/failure", function(req, res, next) {
    var html = "<html>" +
    "<head><title>Bad!</title></head>" +
    "<body><h1>Uh oh...</h1></body>" +
    "</html>";
    res.send(html);
  });

  app.get("/auth/github",
    passport.authenticate('github'),
    function(req, res, next) {
      //
    });

  app.get("/auth/github/callback",
    passport.authenticate("github", {failureRedirect: "/auth/failure"}),
    function(req, res, next) {
      res.redirect("/");
    });

  app.get("/auth/github/callback-2",
    passport.authenticate("github", {failureRedirect: "/auth/failure"}),
    function(req, res, next) {
      var user = req.user;
      var html = "<html>" +
      "<head><title>Welcome Other!</title></head>" +
      "<body><h1>Uh... "+user.name+"!</h1></body>" +
      "</html>";
      res.send(html);
    });

  app.get("/auth/linkedin",
    passport.authenticate('linkedin', {state: 'SOME STATE'}),
    function(req, res, next) {
      //
    });

  app.get("/auth/linkedin/callback",
    passport.authenticate("linkedin", {failureRedirect: "/auth/failure"}),
    function(req, res, next) {
      res.redirect("/");
    });

  app.get("/auth/google",
    passport.authenticate('google', {scope: 'profile email'}),
    function(req, res, next) {
      //
    });

  app.get("/auth/google/callback",
    passport.authenticate("google", {failureRedirect: "/auth/failure"}),
    function(req, res, next) {
      res.redirect("/");
    });
};

/*
 * ensure authenticated
 *
 * @return {Function}
 */

function ensureAuthenticated() {
  return function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/login");
  };
}
