var User = require('../models/users.js');

User.find(function(err, users){
	if(err) return console.log(err);
	if(users.length) return;
	new User({
		authID:'asdfsadf',
		name: 'Ted',
		email: 'Ted@mail.com',
		created:new Date(),
	}).save();
})