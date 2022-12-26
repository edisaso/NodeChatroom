var express = require('express'); //expressJS app
var app = express();
var http = require('http').Server(app); //server
var io = require('socket.io')(http); //creates a new socket.io instance 
                                     //attached to the http server
var users = [];
var rooms = [];
var userNameRoom = {};

//add css
var path = require('path');
app.use(express.static(path.join(__dirname,'public')));

//the message event to pass message from the server to the client
app.get('/', function(req, res) {    
    //console.log(__dirname + '/page.html');
    res.sendFile(__dirname + '/page.html');
});

//listen on port 3000
http.listen(3000, function() {
   console.log('listening on localhost:3000');
});



//The io.on event handler handles connection, disconnection, etc., 
//events in it, using the socket object

io.on('connection', function(socket) {
    console.log('made connection'); 

   //To allow this, Socket.IO provides us the ability to create custom 
   //events. 
   //You can create and fire custom events using the socket.emit function.
   //For example, the following code emits an event called sendNamespace
   
   socket.on('checkUserName', function(data) {
      
      var contains = false;
      console.log("Username: " + data.check);
      for (i=0; i<users.length; ++i) {
           if (users[i] == data.check) {
                contains = true;
                break;
           }
        }

      if (contains) {
          socket.emit("UserNotAppr", {data: ""});
      } else {
	  users[users.length]=data.check;
	  userNameRoom[data.check] = "";
	  console.log("rooms: " + rooms.toString());
          socket.emit('sendRooms', { user: data.check, room: rooms });
      }
   });

   socket.on('chooseRoom', function(data) {
      console.log("Chosen room is " + data.value);
      if (data.isNew) {
          rooms.push(data.value);
          console.log("rooms: " + rooms.toString());
	  io.nsps['/'].adapter.rooms[data.value];
      } 
      socket.join(data.value);
      
      socket.emit('roomApproved', { ext: data.value });
   });

   socket.on("sendMessage", function(data) {
      console.log("room to send: " + data.currRoom);
      socket.join(data.currRoom);

      io.in(data.currRoom).emit('messageFromServer', { user_name: data.user,
	      mess: data.message, datetime1: data.thisDate });
   });
   
   socket.on('disconnect', function () {
      console.log('A user disconnected');
   });	
});

