var express = require('express')
var passport = require('passport')
var handlebars = require('express-handlebars')
var FacebookStrategy = require('passport-facebook').Strategy


// var User = require('./models/user')
var token;

passport.use(new FacebookStrategy({
    clientID: "554823051345511"	,
    clientSecret: "69cc6485df4057fee6e41b4b318ff35d",
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    // profileFields: ['id', 'displayName', 'photos', 'email']
  },
  function(accessToken, refreshToken, profile, cb) {
  	// console.log(profile);
  	console.log(accessToken);
  	 // In this example, the user's Facebook profile is supplied as the user
    // record.  In a production-quality application, the Facebook profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authentication with other identity
    // providers.
    token = accessToken;
    return cb(null,profile);
    // return accessToken;
  }
));

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Twitter profile is serialized
// and deserialized.
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});


var app = express();

app.engine("handlebars", handlebars({defaultLayout: "main"}));
app.set("view engine", "handlebars");

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());


app.get('/auth/facebook', passport.authenticate('facebook', { authType: 'rerequest', scope: ['user_friends'] }))

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    // console.log("redirect succeeded")
    res.redirect('/main');
  });


app.get('/login', function(req, res){
	// console.log("redirect failed...")
	res.sendFile('login.html')
})
app.get('/main', function(req, res){
	console.log(req.user);

	res.render('profile', {id: req.user.id, name: req.user.displayName})

})

app.use(express.static(__dirname + '/public'))

app.set('port', process.env.APP_PORT || 3000)

app.listen(app.get('port'), function(){
	console.log('Application started on ' + app.get('port'))
})