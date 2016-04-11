var express = require('express')
var passport = require('passport')
var handlebars = require('express-handlebars')
var FacebookStrategy = require('passport-facebook').Strategy
var request = require('request');

var app = express();
var env = app.get('env');

//////////////////////////////////
////////Configure MONGO DB
///////////////////////////////////
var mongoose = require('mongoose');
var opts = {
  server:{
    socketOption:{keepAlive: 1}
  }
};
var DBURL = 'mongodb://localhost/db';

var User = require('./models/users.js')


switch(env){
  case 'development':
    mongoose.connect(DBURL, opts);
    break
  case 'production':
    mongoose.connect(DBURL, opts);
    break;
  default:
    throw new Error('Unknown execution enviroment: ' + env);
}

//load some data, only needs to be loaded once
require('./models/data.js');

app.engine("handlebars", handlebars({defaultLayout: "main"}));
app.set("view engine", "handlebars");

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true}));

/////////////////////////////////////
////////Authentication
////////////////////////////////////

var credentials = require('./lib/credentials.js');
var auth = require('./lib/auth.js')(app, {
  baseUrl: process.env.BASE_URL,
  providers: credentials.authProviders,
  successRedirect: '/main',
  failureRedirect: '/unauthorized',
});

auth.init();
auth.registerRoutes();

////////////////////////////
//Routing
//////////////////////////
var routes = require('./routes/routes.js');
var router = express.Router();

var cors = require('cors');

app.use('/api', cors());
app.use('/api', routes);

app.get('/unauthorized', function(req, res){
	// console.log("redirect failed...")
  res.status(403).send('Unauthorized to access this page');
})

app.get('/main', function(req, res, next){
 // res.send("authentication Successful");
 if(!req.user) return res.redirect(403, '/unauthorized');
 res.render('profile');

});


//////////////////////////////////
///////Geocode
////////////////////////////////
var geocode = require('./lib/geocode');
var addr = '25 Heng Mui Keng';

geocode(addr, function(err, coords){
  if(err) return console.log('Geocoding failed for ' + addr);
  console.log(coords);
})

//add to google map

/////////////////////////////////////
///Do something over time interval
//////////////////////////////////////
var url = 'https://6-edge-chat.facebook.com/pull?channel=p_900660696&seq=1&partition=-2&clientid=17659dc5&cb=8puc&idle=0&qp=y&cap=8&pws=fresh&isq=64530&msgs_recv=0&uid=900660696&viewer_uid=900660696&sticky_token=22&sticky_pool=atn2c06_chat-proxy&state=active';
var interval = 1000;

var request = require('request');
var j = request.jar();
var cookie = request.cookie('key: datr=fVoEV8olFzHzqhTOGZF9WIrE; pl=n; lu=RQ1mvecJw3mAGaoTiONcX1gg; c_user=900660696; fr=0VhWHapS7vO6LSlWA.AWV-M_ZPazog9RJZlJiGSi8VYGk.BXBFqK.YF.AAA.0.AWVHr06_; xs=151%3AF5TPpzO5hyDi4A%3A2%3A1459903114%3A17914; csm=2; s=Aa4FWlQuY75I3W54.BXBFqK; sb=AAIHV1x1czFbxQwKQQU5YzN-; act=1460357443368%2F9; p=-2; wd=1047x486; presence=EDvF3EtimeF1460357905EuserFA2900660696A2EstateFDutF1460357905931Et2F_5b_5dElm2FnullEuct2F1460336947BEtrFA2loadA2EtwF975659311EatF1460357905351CEchFDp_5f900660696F1CC');
j.setCookie(cookie, url);

request({url: url, jar: j}, function (error, response, body) {
  console.log(response);
  if (!error && response.statusCode == 200) {
    console.log(body) // Show the HTML for the Google homepage. 
  }
})
// function runOnInterval() {
//   doSomething();
//   setTimeout(runOnInterval, interval);
// }

// function doSomething() {
//    console.log('do something')
// }

// runOnInterval();

app.use(express.static(__dirname + '/public'))

app.set('port', process.env.APP_PORT || 3000)

app.listen(app.get('port'), function(){
	console.log('Application started on ' + app.get('port'))
})
