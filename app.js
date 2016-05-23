var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

var users = [];

io.on('connection', function(socket){
var player = socket.id;

  console.log('a user connected');
  socket.on('new user', function(data, callback){

    console.log(users);
    if(users.indexOf(data) != -1){
      callback(false);
    } else {
      callback(true);
      socket.nickname = data;
      users.push(socket.nickname);
      console.log("new user added: " + socket.nickname);
    }

    io.emit('online users', users);
  });

  socket.on('disconnect', function(){
    io.emit('disconnect');
  });

  //receive emitted message
  socket.on('chat message', function(msg){
    console.log('message ' + msg);
    //broadcast event to everyone
    io.emit('chat message', msg);
  });

});



http.listen(3000, function(){
  console.log('listening on *:3000');
});