var express = require('express');
var router = express.Router();

var User = require('../models/users.js');

//middlewear for processing API requests
router.use(function(req, res, next){
	// For logging and validation of requests
	next();
});

// api/
router.get('/', function(req, res){
	res.send('Welcome to API');
});

router.route('/users')
	.get(function(req, res){
		User.find(function(err, users){
			if (err) return res.status(500).send('Error ' + err);
			res.json(users.map(function(user){
				return{
					authID: user.authID,
					name: user.name,
					email: user.email,
				}
			}));
		});
	});

module.exports = router;