var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var Functions = require("./Functions.js");
var Random = Functions.Rand;
var C_Up = Functions.Collis_U;
var C_Down = Functions.Collis_D;
var C_Left = Functions.Collis_L;
var C_Right = Functions.Collis_R;

//Server variables
var messages =[];
var Users = [];
var FirstUserToJoin;
var colors = ["blue","red","yellow","green"];
var Taken;



//Game variables

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
var Background;

//Map-setup

function Start(){
    Obstacle_amount = Random(10, 20);
    Max_Gold = Random(1,3);
    Background = Random(1,4);
    while(Obstacle_amount){
        var x = Random(0,23)*side;
        var y = Random(0,23)*side;
        if(Check_if_Occupied(x,y)){continue;}
        Obstacle_coords.push([x,y]);
        Obstacle_amount--;
    }
    Player_Coords.blue = [64,64,false,0,10];
    Player_Coords.red = [64, 672,false,0,10];
    Player_Coords.yellow = [672,672,false,0,10];
    Player_Coords.green = [672,64,false,0,10];

    setInterval(function(){ 
        if(Gold_coords.length<Max_Gold){
            while(true){
                var x = Random(0,23)*side;
                var y = Random(0,23)*side;
                if(Check_if_Occupied(x,y)){continue;}
                Gold_coords.push([x,y]);
                break;
            }
        }
    }, 5000);
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
    Start();
    io.sockets.emit("updatePlayerCoords", Player_Coords);
    io.sockets.emit("display message start", messages);
    io.sockets.emit("ReceiveObstacles", [Obstacle_coords, Background]);
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
            while(true){
                var A = Random(colors);
                for(i in Players){
                    if(Players[A]!=""){
                        continue;
                    }
                }
                Players[A] = data;
                io.sockets.connected[socket.id].emit("GetColor", A);
                break;
            }
        }
    });
    socket.on("Move",function(data){
        New=CheckCollision(data[1], Player_Coords[data[0]][0], Player_Coords[data[0]][1], data[0]);
        if(Array.isArray(New)){
            for(var i in Base_Coords[data[0]]){
                if((Base_Coords[data[0]][i][0]==New[0]&&Base_Coords[data[0]][i][1]==New[1]) && Player_Coords[data[0]][2]){
                    Player_Coords[data[0]][3]++;
                    Player_Coords[data[0]][2]=false;
                    io.sockets.emit("updatePlayerCoords", Player_Coords);
                    io.sockets.emit("AnnouncePoint",data[0]);
                }
            }
        }
        if(New===true){
            io.sockets.emit("updatePlayerCoords", Player_Coords);
        }
    });
    socket.on("AskGold",function(){
        io.sockets.emit("GetGoldCoords",Gold_coords);
    });
    }
);





function CheckCollision(direction, x, y, color){
    var i;
switch(direction){
    case "up":
        if(y==0){
            return false;
        }
        for(i = 0; i<Constant_Taken_Positions.length-4;i++){
            if (C_Up([Constant_Taken_Positions[i][0],Constant_Taken_Positions[i][1],x,y])) {
                    return Constant_Taken_Positions[i];
            }
        }
        for(i in Obstacle_coords){
            if (C_Up([Obstacle_coords[i][0],Obstacle_coords[i][1],x,y])){
                    return false;
            }
        }
        for(i in Gold_coords){
            if (C_Up([Gold_coords[i][0],Gold_coords[i][1],x,y])){
                if(!Player_Coords[color][2]){
                    Gold_coords.splice(i,1);
                    Player_Coords[color][2]=true;
                }
                else{
                    return false;
                }
            }
        }
        Player_Coords[color][1]-=4;
        break;  
    case "down":
        if(y==736){
            return false;
        }
        for(i = 0; i<Constant_Taken_Positions.length-4;i++){
            if (C_Down([Constant_Taken_Positions[i][0],Constant_Taken_Positions[i][1],x,y])) {
                    return Constant_Taken_Positions[i];
            }
        }
        for(i in Obstacle_coords){
            if (C_Down([Obstacle_coords[i][0],Obstacle_coords[i][1],x,y])){
                    return false;
            }
        }
        for(i in Gold_coords){
            if (C_Down([Gold_coords[i][0],Gold_coords[i][1],x,y])){
                if(!Player_Coords[color][2]){
                    Gold_coords.splice(i,1);
                    Player_Coords[color][2]=true;
                }
                else{
                    return false;
                }
            }
        }
        Player_Coords[color][1]+=4;
        break;  
    case "left":
        if(x==0){
            return false;
        }
        for(i = 0; i<Constant_Taken_Positions.length-4;i++){
            if (C_Left([Constant_Taken_Positions[i][0],Constant_Taken_Positions[i][1],x,y])) {
                    return Constant_Taken_Positions[i];
            }
        }
        for(i in Obstacle_coords){
            if (C_Left([Obstacle_coords[i][0],Obstacle_coords[i][1],x,y])){
                    return false;
            }
        }
        for(i in Gold_coords){
            if (C_Left([Gold_coords[i][0],Gold_coords[i][1],x,y])){
                if(!Player_Coords[color][2]){
                    Gold_coords.splice(i,1);
                    Player_Coords[color][2]=true;
                }
                else{
                    return false;
                }
            }
        }
        Player_Coords[color][0]-=4;
        break;  
    case "right":
        if(x==736){
            return false;
        }
        for(i = 0; i<Constant_Taken_Positions.length-4;i++){
            if (C_Right([Constant_Taken_Positions[i][0],Constant_Taken_Positions[i][1],x,y])) {
                    return Constant_Taken_Positions[i];
            }
        }
        for(i in Obstacle_coords){
            if (C_Right([Obstacle_coords[i][0],Obstacle_coords[i][1],x,y])){
                    return false;
            }
        }
        for(i in Gold_coords){
            if (C_Right([Gold_coords[i][0],Gold_coords[i][1],x,y])){
                if(!Player_Coords[color][2]){
                    Gold_coords.splice(i,1);
                    Player_Coords[color][2]=true;
                }
                else{
                    return false;
                }
            }
        }
        Player_Coords[color][0]+=4;
    }
    return true;
}

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