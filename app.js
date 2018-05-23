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
    [0,0],    [32,0],
    [32,0],   [32,32],
    [0,704],   [32,704],
    [0,736],   [32,736],
    [704,704],  [736,704],
    [704,736],  [736,736],    
    [704,0],    [736,32],
    [736,0],    [704,32],
    [64,64], [64, 704],
    [704,704],[704,64]    
    ];
var Base_Coords = {
    blue:[  [0,0],    [32,0],
            [0,32],   [32,32]
        ],
    red:[   [0,704],   [32,704],
            [0,736],   [32,736]
        ],
    yellow:[    
            [704,704],  [736,704],
            [704,736],  [736,736]],

    green:[
            [704,0],    [736,32],
            [736,0],    [704,32]
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
    Obstacle_amount = Random(10, 20);
    Max_Gold = Random(2,5);
    while(Obstacle_amount){
        var x = Random(0,23)*side;
        var y = Random(0,23)*side;
        if(Check_if_Occupied(x,y)){continue;}
        Obstacle_coords.push([x,y]);
        Obstacle_amount--;
    }
    Player_Coords.blue = [64,64,false];
    Player_Coords.red = [64, 704,false];
    Player_Coords.yellow = [704,704,false];
    Player_Coords.green = [704,64,false];
    for(var i in Users){
            var Temp;
        while(true){
            Temp = Random(colors);
            if(Player[Temp]==""){
                Player[Temp]=Users[i];
            }
        }
    }
}

Start();

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
    io.sockets.emit("ReceiveObstacles", Obstacle_coords);
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
    socket.on("Move",function(data){
        console.log(Player_Coords);
        New=CheckCollision(data[1], Player_Coords[data[0]][0], Player_Coords[data[0]][0], data[0]);
        if(typeof(New)==Array){
            for(var i in Base_Coords[data[0]]){
                if(Base_Coords[data[0]]==New && Player_Coords[data][2]){
                    Points[data[0]]++;
                }
            }
        }
        if(New===true){
            io.sockets.emit("updatePlayerCoords", Player_Coords);
        }

    });
    }
);



function Check_if_Occupied(x,y){
    for(var i in Constant_Taken_Positions){
        if(Constant_Taken_Positions[i][0]==x && Constant_Taken_Positions[i][1]==y){
            return Constant_Taken_Positions[i];
        }
    }
    for( i in Obstacle_coords){
        if(Obstacle_coords[i][0]==x && Obstacle_coords[i][1]==y){
            return true;
        }
    }
    for( i in Gold_coords){
        if(Gold_coords[i][0]==x && Gold_coords[i][1]==y){
            return Gold_coords[i];
        }
    }
    return false;
}

function CheckCollision(direction, x, y, color){
    x+=16;
    y+=16;
switch(direction){
    case "up":
        for(var i = 0; i<Constant_Taken_Positions.length-4;i++){
            if (y - Constant_Taken_Positions[i][1]+16 <= side && y - Constant_Taken_Positions[i][1]+16 >= 0) {
                if (Math.abs(x - Constant_Taken_Positions[i][0]+16) < side) {
                    return Constant_Taken_Positions[i];
                }
            }
        }
        for(var i in Obstacle_coords){
            if (y - Obstacle_coords[i][1]+16 <= side && y - Obstacle_coords[i][1]+16 >= 0) {
                if (Math.abs(x - Obstacle_coords[i][0]+16) < side) {
                    return false;
                }
            }
        }
        Player_Coords[color][1]--;
        break;  
    case "down":
        for(var i = 0; i<Constant_Taken_Positions.length-4;i++){
            if (Constant_Taken_Positions[i][1]+16 - y <= side && Constant_Taken_Positions[i][1]+16 - y >= 0) {
                if (Math.abs(x - Constant_Taken_Positions[i][0]+16) < side) {
                    return Constant_Taken_Positions[i];
                }
            }
        }
        for(var i in Obstacle_coords){
            if (Obstacle_coords[i][1]+16 - y <= side && Obstacle_coords[i][1]+16 - y >= 0) {
                if (Math.abs(x - Obstacle_coords[i][0]+16) < side) {
                    return false;
                }
            }
        }
        Player_Coords[color][1]++;
        break;  
    case "left":
        for(var i = 0; i<Constant_Taken_Positions.length-4;i++){
            if (x - Constant_Taken_Positions[i][0]+16 <= side && x - Constant_Taken_Positions[i][0]+16 >= 0) {
                if (Math.abs(y - Constant_Taken_Positions[i][1]+16) < side) {
                    return Constant_Taken_Positions[i];
                }
            }
        }
        for(var i in Obstacle_coords){
            if (x - Obstacle_coords[i][0]+16 <= side && x - Obstacle_coords[i][0]+16 >= 0) {
                if (Math.abs(y - Obstacle_coords[i][1]+16) < side) {
                    return false;
                }
            }
        }
        Player_Coords[color][0]--;
        break;  
    case "right":
        for(var i = 0; i<Constant_Taken_Positions.length-4;i++){
            if (Constant_Taken_Positions[i][0]+16 - x <= side && Constant_Taken_Positions[i][0]+16 - x >= 0) {
                if (Math.abs(y - Constant_Taken_Positions[i][1]+16) < side) {
                    return Constant_Taken_Positions[i];
                }
            }
        }
        for(var i in Obstacle_coords){
            if (Obstacle_coords[i][0]+16 - x <= side && Obstacle_coords[i][0]+16 - x >= 0) {
                if (Math.abs(y - Obstacle_coords[i][1]+16) < side) {
                    return false;
                }
            }
        }
        Player_Coords[color][1]++;
    }
    return true;
}