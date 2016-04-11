var http = require('http');

module.exports = function(query, cb){
	var options = {
		hostname: 'maps.google.com',
		path: '/maps/api/geocode/json?address=' + encodeURIComponent(query) + '&sensor=false',
	};

	http.request(options, function(res){
		var data = '';
		//async to get data
		res.on('data', function(body){
			data += body;
		});
		res.on('end', function(end){
			data = JSON.parse(data);
			if(data.results.length){
				cb(null, data.results[0].geometry.location);
			}else{
				cb('No results found', null);
			}

		});
	}).end();
}