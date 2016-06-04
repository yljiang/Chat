var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Modules //

var AIMLInterpreter = require('AIMLInterpreter');
var fs = require('fs');
var xml2js = require('xml2js');

var users = {};

var aimlInterpreter = new AIMLInterpreter({name:'Alice', state:'happy'});
aimlInterpreter.loadAIMLFilesIntoArray(['alice.xml', 'usercmds.xml']);

app.use(express.static(__dirname + '/public'));


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

  socket.on('append aiml', function(data){

    var xml = '<category><pattern>' + data.command + '</pattern><template>' + data.response + '</template></category>';
    
    var entry = {
      pattern : [data.command],
      template: [data.response],
    };

    //figure how to append it to alice.xml
    xmlToJs('/usercmds.xml', entry, function(err, obj){
      if(err) throw(err);
      jsToXml('/usercmds.xml', obj, function(err){
        //One new command is appended
        //reload aiml file
        aimlInterpreter.loadAIMLFilesIntoArray(['usercmds.xml']);

      });
    });


  });

});

function xmlToJs(filename, entry, cb){
    var parser = new xml2js.Parser();

  fs.readFile(__dirname + filename, function(err, data){
      parser.parseString(data, function(err, xmlStr){
        // console.log(JSON.stringify(result));
        if(err) throw (err);

        xmlStr.aiml.category.push(entry);
        // console.log(xmlStr.aiml.category);
        cb(err, xmlStr);
      });
    });
}

function jsToXml(filename, obj, cb){
  var filepath = __dirname + filename;
  var builder = new xml2js.Builder();
  var xml = builder.buildObject(obj);

  fs.writeFile(filepath, xml, cb);
}

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
