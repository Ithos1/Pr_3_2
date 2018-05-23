var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var Random = require("./Random.js");

//Server variables
var messages =[];
var Users = [];
var FirstUserToJoin;
var colors = ["blue","red","yellow","green"];
var Taken;



//Game variables

var Points = {
    blue:0,
    red:0,
    yellow:0,
    green:0
};
var Players = {
    blue:"",
    red:"",
    yellow:"",
    green:""
};
var Player_Coords = {
    blue:[],
    red:[],
    yellow:[],
    green:[]
};
var Constant_Taken_Positions = [
        
        
        
        
    ];
var Base_Coords = {
    blue:[  [0,0],    [32,0],
            [32,0],   [32,32]
        ],
    red:[   [0,744],   [32,744],
            [0,768],   [32,768]
        ],
    yellow:[    
            [744,744],  [768,744],
            [744,768],  [768,768]],

    green:[
            [744,0],    [768,32],
            [768,0],    [744,32]
    ]
};
var Obstacle_coords = [];
var Obstacle_amount;
var Gold_coords = [];
var Max_Gold;
var viewDistance;
var side = 32;

//Map-setup

function Start(){
    Obstacle_amount = Random(5, 20);
    Max_Gold = Random(2,5);
    while(Obstacle_amount){
        var x = Random(0,24);
        var y = Random(0,24);
        for(var i in Constant_Taken_Positions){
            if(Constant_Taken_Positions[0]==x && Constant_Taken_Positions[1]==y){
                continue;
            }
        }
        Obstacle_coords.push([x,y]);
        Obstacle_amount--;
    }
}


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
    socket.on("send message", function (data, name){
        if(name){
            var mes = name + " : " + data;
            messages.push(mes);
            io.sockets.emit("display message", mes);
        }
    });
    socket.on("AddPlayer", function(data){
        Taken=false;
        for(var i in Users){
            if(data == Users[i]){
                Taken=true;
            }
        }
        if(Taken){
            io.sockets.connected[socket.id].emit("Taken");
        }
        else{
            Users.push(data);
            io.sockets.emit("Announce_Player", data);
        }
    });
    }
);