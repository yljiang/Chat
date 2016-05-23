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

    if(users.indexOf(data) != -1){
      callback(false);
    } else {
      callback(true);
      socket.nickname = data;
      users.push(socket.nickname);
      console.log("new user added: " + socket.nickname);
      io.emit('user connected', socket.nickname);
      updateOnlineUsers();
    }
   
  });

  function updateOnlineUsers(){
    var html = '';
    for(var name of users){
      html += '<li>' + name + '</li>'; 
    }
    console.log(html);
    io.emit('online users', html);
  }

  socket.on('disconnect', function(){
    io.emit('disconnect', socket.nickname);
    users.splice(users.indexOf(socket.nickname), 1);
    updateOnlineUsers();

  });

  //receive emitted message
  socket.on('send message', function(msg){
    console.log('message ' + msg);
    //broadcast event to everyone
    io.emit('new message', {name: socket.nickname, msg: msg});
  });

});



http.listen(3000, function(){
  console.log('listening on *:3000');
});