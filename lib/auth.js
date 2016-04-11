var User = require('../models/users.js');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.serializeUser(function(user, done){
	// done(null, user._id);
	done(null, user);
});

passport.deserializeUser(function(id, done){
	// User.findById(id, function(err, user){
	// 	if(err || !user) return done(err, null);
	// 	done(null, user);
	// })
	done(null, id);
});

//req.session.passport.user == user model instance

module.exports = function(app, options){
	if(!options.successRedirect)
		options.successRedirect = '/account';
	if(!options.failureRedirect)
		options.failureRedirect = '/unauthorized';

	return {
		init: function(){
			var env = app.get('env');
			var config = options.providers;

			passport.use(new FacebookStrategy({
				clientID: config.facebook[env].clientID,
				clientSecret: config.facebook[env].clientSecret,
				callbackURL: (options.baseUrl || '') + '/auth/facebook/callback',
			}, function(accessToken, refreshToken, profile, done){
				//if Authenticates successful, look up the user
				var authId = 'facebook:' + profile.id;

				User.findOne({authId: authId},function(err, user){
					if (err) return done(err, null);
					if (user) return done(null, user);
					user = new User({
						authId: authId,
						name: profile.displayName,
						created: Date.now(),
					});
					user.save(function(err){
						console.log('New User created: ' + user.name);
						if(err) return done(err, null);
						done(null, user);
					});
				});
			}));

			passport.use(new GoogleStrategy({
				clientID: config.google[env].clientID,
				clientSecret: config.google[env].clientSecret,
				callbackURL: (options.baseUrl || '') + '/auth/google/callback',
			}, function(accessToken, refreshToken, profile, done){
				//if Authenticates successful, look up the user
				var authId = 'google:' + profile.id;

				User.findOne({authId: authId},function(err, user){
					if (err) return done(err, null);
					if (user) return done(null, user);
					user = new User({
						authId: authId,
						name: profile.displayName,
						created: Date.now(),
					});
					user.save(function(err){
						console.log('New User created: ' + user.name);
						if(err) return done(err, null);
						done(null, user);
					});
				});
			}));
			
			// Initialize Passport and restore authentication state, if any, from the
			// session.
			app.use(passport.initialize());
			app.use(passport.session());
		},

		registerRoutes: function(){
			//register facebook routes
			app.get('/auth/facebook', function(req, res, next){
				if(req.query.redirect) req.session.authRedirect = req.query.redirect;
				passport.authenticate('facebook', 
					{ scope: 
						['email, user_location, user_friends, \
						  user_likes, user_photos, user_posts, \
						  user_status'
						]
					})(req, res, next);
			});

			app.get('/auth/facebook/callback',
			  passport.authenticate('facebook', { failureRedirect: options.failureRedirect }),
			  function(req, res) {
			  	// console.log(req.session);
			    // Successful authentication, redirect home.
			    var redirect = req.session.authRedirect;
			    if(redirect) delete req.session.authRedirect;
			    res.redirect(303, redirect || options.successRedirect);
			  });

			app.get('/auth/google', function(req, res, next){
				if(req.query.redirect) req.session.authRedirect = req.query.redirect;
				passport.authenticate('google', {scope : 'profile'})(req, res, next);
			});
			
			app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: options.failureRedirect }),
			function(req, res){
				var redirect = req.session.redirect;
				if(redirect) delete req.session.authRedirect;
				res.redirect(303, redirect || options.successRedirect);
			})
		},
	};
};

var auth