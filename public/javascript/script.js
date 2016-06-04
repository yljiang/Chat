var socket = io();
$('#userlist').hide();

//Registration
$('#registration').submit(function(e){
  e.preventDefault();

  socket.emit('new user', $('#nickname').val(), function(data){

    if(data){
      $('#chat').show();
      $('#registration-div').hide();
      $('#userlist').show();
      $('#m').focus();
    } else {
      $('#username-taken').html('<b>Sorry! Username is already taken!</b>');
    }
  });
});

//Send message
$('#chat-form').submit(function(e){
  e.preventDefault();  
  
  socket.emit('send message', $('#m').val(), function(response){
      // console.log(response);
      if(response !== true){
        $('#messages').append('<li><span class="error">'+ response + '</span></li>');
      }
  });

  $('#m').val('');
  return false;
});

$('#aiml-form').submit(function(e){
  e.preventDefault();
  var command = $('#aiml-command').val().toUpperCase();
  var response = $('#aiml-response').val();

  socket.emit('append aiml',{response: response, command: command});

});
// capture broadcasted events from backend
socket.on('new message', function(data){
  $('#messages').append('<li><b>' +  data.name +'</b>: ' + data.msg + '</li>');

  //set scroll to bottom 
  var elem = document.getElementById('chat');
  elem.scrollTop = elem.scrollHeight; 
});

socket.on('pm to', function(data){
  $('#messages').append('<li><span class="pm"><b>From ' +  data.name +'</b>: ' + data.msg + '</span></li>');
  //set scroll to bottom 
  var elem = document.getElementById('chat');
  elem.scrollTop = elem.scrollHeight; 
});

socket.on('pm from', function(data){
  $('#messages').append('<li><b>To ' +  data.name +'</b>: ' + data.msg + '</li>');
  //set scroll to bottom 
  var elem = document.getElementById('chat');
  elem.scrollTop = elem.scrollHeight; 
});


socket.on('online users', function(html){
    $('#onlineusers').html(html);
});

socket.on('user connected', function(user){
  $('#messages').append('<li>' + user + ' has connected </li>');
      //set scroll to bottom 
  var elem = document.getElementById('chat');
  elem.scrollTop = elem.scrollHeight; 
});

socket.on('disconnect', function(user){
  $('#messages').append('<li>' + user + ' has disconnected </li>');
      //set scroll to bottom 
  var elem = document.getElementById('chat');
  elem.scrollTop = elem.scrollHeight; 
});

