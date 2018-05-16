var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var messages =[];

//Server
app.use(express.static("./public"));

app.get("/", function(req, res){
   res.redirect("./public");
});

server.listen(3000, function(){
   console.log("Example is running on port 3000");
});

io.on('connection', function(socket){
    io.sockets.emit("display message start", messages);
    socket.on("send message", function (data){
        messages.push(data);
        io.sockets.emit("display message", data);
    });
    }
);