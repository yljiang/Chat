var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var AIMLInterpreter = require('AIMLInterpreter');

var aimlInterpreter = new AIMLInterpreter({name:'Alice', state:'happy'});
aimlInterpreter.loadAIMLFilesIntoArray(['alice.xml']);

app.use(express.static(__dirname + '/public'));

var users = {};

io.on('connection', function(socket){
var player = socket.id;

  console.log('a user connected');
  socket.on('new user', function(data, callback){

    if(data in users){
      callback(false);
    } else {
      callback(true);
      socket.nickname = data;
      users[socket.nickname] = socket;

      io.emit('user connected', socket.nickname);
      updateOnlineUsers();
    }
   
  });

  socket.on('disconnect', function(){
    io.emit('disconnect', socket.nickname);
    
    delete users[socket.nickname];

    updateOnlineUsers();

  });

  //receive emitted message
  socket.on('send message', function(msg, callback){
    console.log('message ' + msg);
    
    msg = msg.trim();

    //check if its a whisper
    if(msg.substr(0,3) == '/w '){
      msg = msg.substr(3);
      var idx = msg.indexOf(' ');
      if(idx == -1){

        callback('Please enter a message.');
      } else {
        
        var to = msg.substr(0, idx);
        var pm = msg.substr(idx+1);

        if(!(to in users)){

          callback('That user does not exist.');

        }else{
          //send private message
          users[socket.nickname].emit('pm from', {name: to, msg: pm.trim()});
          users[to].emit('pm to', {name: socket.nickname, msg: pm.trim()});
          //display on own chat box
          // users[socket.nickname].emit('pm', {name: socket.nickname, msg: pm.trim()});

          callback(true);
        }

      }
    } else if (msg.substr(0,7) == '/alice '){
        console.log('Chatting with Alice');
        msg = msg.substr(6);
        var response;
        //Get alice response
        var getResponse = function(answer, wildCardArray, input){
          console.log(answer + ' | ' + wildCardArray + ' | ' + input);
          response = answer;
        };

        aimlInterpreter.findAnswerInLoadedAIMLFiles(msg, getResponse);

        users[socket.nickname].emit('pm from', {name: 'Alice', msg: msg});

        //emit Alice reponse to yourself
        users[socket.nickname].emit('pm to', {name: 'Alice', msg: response});

        callback(true);

    } else{
      //broadcast event to everyone
      io.emit('new message', {name: socket.nickname, msg: msg});
    }


  });

});

function updateOnlineUsers(){
  var html = '';
  for(var name in users){
    html += '<li>' + name + '</li>'; 
  }
  console.log(html);
  io.emit('online users', html);
}



http.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:3000');
});
