var express = require('express')
var passport = require('passport')
var handlebars = require('express-handlebars')
var FacebookStrategy = require('passport-facebook').Strategy
var request = require('request')
var http = require('http')

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
  	// console.log(accessToken);
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

app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email, user_location, user_friends, user_likes, user_photos, user_posts, user_status'] }))

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/main');
  });


app.get('/login', function(req, res){
	// console.log("redirect failed...")
	res.sendFile('login.html')
})

app.get('/main', function(req, res, next){
  //friends node /user.id/friends
  //relationships /user.id?fields=relationship_status,gender,age_range

  var url = 'https://graph.facebook.com/v2.5/me/feed' 
  // console.log(token);
  // https://graph.facebook.com/v2.5/me/friends?access_token=CAAH4m87jfmcBADrG85RM3jjiTXLB0oKzizsuPJ60FHW5wwKnt9TwMQs8SIUQRnQtq2k0ZCbIkNwEQmHtJB4lvH81LDRjmZB9ZBgM65ZAJu9NlTPrM5Nv3H8A8WZAXadGPdsNoH3AiPGCoV1F4X4DSyz80ZAsFWKQgtU24e8mZCOGrSTyIHwlaEW1D7zPGNBKl9c2PQqIBXBRAZDZD
  console.log(url+'?access_token=' + token)

  var friends;
  // One example of doing get request
  request
    .get({url: url+'?access_token=' + token}, function(err, res, body){
      var info = JSON.parse(body)

      console.log(info)
    })


  // http.get


  console.log(res.body);
  res.json(res.body)
  // console.log(token);

})

app.use(express.static(__dirname + '/public'))

app.set('port', process.env.APP_PORT || 3000)

app.listen(app.get('port'), function(){
	console.log('Application started on ' + app.get('port'))
})
