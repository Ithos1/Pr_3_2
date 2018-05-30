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
var Game = false;

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
var Player_Info = {
    blue:{
        x:0,
        y:0,
        gold:false,
        points:0,
        energy:0,
        boost:0,
        direction_draw:"",
        direction:""
    },
    red:{
        x:0,
        y:0,
        gold:false,
        points:0,
        energy:0,
        boost:0,
        direction_draw:"",
        direction:""
    },
    yellow:{
        x:0,
        y:0,
        gold:false,
        points:0,
        energy:0,
        boost:0,
        direction_draw:"",
        direction:""
    },
    green:{
        x:0,
        y:0,
        gold:false,
        points:0,
        energy:0,
        boost:0,
        direction_draw:"",
        direction:""
    }
};
var laser_coords=[];
var Constant_Taken_Positions = [
    [0,0],    [32,0],
    [0,32],   [32,32],
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
var Power_Coords = [];
var Obstacle_amount;
var Gold_coords = [];
var Max_Gold;
var viewDistance;
var side = 32;
var Background;
var colors = [];
//Map-setup

function Start(){
    Gold_Coords=[];
    Obstacle_amount = Random(25, 50);
    Max_Gold = Random(1,3);
    Background = Random(1,4);

    while(Obstacle_amount){
        var x = Random(0,23)*side;
        var y = Random(0,23)*side;
        if(Check_if_Occupied(x,y)){continue;}
        Obstacle_coords.push([x,y]);
        Obstacle_amount--;
    }
    Player_Info.blue = {
        x:64,
        y:64,
        gold:false,
        points:0,
        energy:10,
        boost:0,
        direction_draw:"left",
        direction:"left",
        cd:0
    };
    Player_Info.red = {
        x:64, 
        y:672,
        gold:false,
        points:0,
        energy:10,
        boost:0,
        direction_draw:"left",
        direction:"left",
        cd:0
    };
    Player_Info.yellow = {
        x:672,
        y:672,
        gold:false,
        points:0,
        energy:10,
        boost:0,
        direction_draw:"left",
        direction:"left",
        cd:0
    };
    Player_Info.green = {
        x:672,
        y:64,
        gold:false,
        points:0,
        energy:10,
        boost:0,
        direction_draw:"left",
        direction:"left",
        cd:0
    };
    colors = ["blue","red","yellow","green"];
    

}

function Intervals(){
    console.log("This program was made by Vahan (Ithos) Tumasyan for TUMO : Programming 3 workshop.");
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

    setInterval(function(){
        if(Power_Coords.length<2){
            while(true){
                var x = Random(0,23)*side;
                var y = Random(0,23)*side;
                if(Check_if_Occupied(x,y)){continue;}
                Power_Coords.push([x,y]);
                break;
            }
        }
    }, 15000);
    //Boost_expire && Laser_Cooldown
    setInterval(function(){
        for (var i in Player_Info){
            if(Player_Info[i].boost>0){
                Player_Info[i].boost--;
            }
            if(Player_Info[i].cd>0){
                Player_Info[i].cd--;
            }
        }
    },1000);
    //Laser_movement
    setInterval(function(){
        for(var i in laser_coords){
            New = CheckCollision(laser_coords[i][2],laser_coords[i][0],laser_coords[i][1],null,true);
            if(typeof New =="string"){
                Player_Info[New].energy=0;
                laser_coords.splice(i,1);
            }
            else if(New){
                switch (laser_coords[i][2]){
                    case "up":
                        laser_coords[i][1]-=8;
                        break;
                    case "down":
                        laser_coords[i][1]+=8;
                        break;
                    case "left":
                        laser_coords[i][0]-=8;
                        break;
                    case "right":
                        laser_coords[i][0]+=8;
                }
            }
            else{
                laser_coords.splice(i,1);
            }
        }
    },25);


}


//Server
app.use(express.static("./public"));

app.get("/", function(req, res){
   res.redirect("./public");
});

server.listen(3000, function(){
    Start();
    Intervals();
    console.log("Example is running on port 3000");
});

io.on('connection', function(socket){

    io.sockets.emit("updatePlayerCoords", Player_Info);
    io.sockets.emit("display message start", messages);
    io.sockets.emit("ReceiveObstacles", [Obstacle_coords, Background]);
    socket.on("send message", function (data, name){
        if(data == "/Start" && !Game){
            Game = true;
            io.sockets.emit("Start");
        }
        else if(data == "/Reset" && !Game){
            Obstacle_coords=[];
            Gold_Coords=[];
            Power_Coords=[];
            Start();
            io.sockets.emit("ReceiveObstacles", [Obstacle_coords, Background]);
            var Players = {
                blue:"",
                red:"",
                yellow:"",
                green:""
            };
            for(var i in Users){
                var A = Random(0, colors.length-1);
                Players[colors[A]] = Users[i];   
                colors.splice(A,1);
            }
            io.sockets.emit("Reset",Players);

        }
        else if(name){
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
                var A = Random(0, colors.length-1);
                Players[colors[A]] = data;
                io.sockets.connected[socket.id].emit("GetColor", colors[A]);
                colors.splice(A,1);
                console.log(Players, colors);
            }
            if(Users.length==4){
                Game = true;
                io.sockets.emit("Start");
            }
        }
    );
    socket.on("Shoot",function(data){
        if(data){
            if(Player_Info[data].cd==0 && Player_Info[data].energy>=2){
                switch(Player_Info[data].direction){
                    case "left":
                        laser_coords.push([Player_Info[data].x-32,Player_Info[data].y,"left"]);
                        Player_Info[data].cd++;
                        break;
                    case "right":
                        laser_coords.push([Player_Info[data].x+32,Player_Info[data].y,"right"]);
                        Player_Info[data].cd++;
                        break;
                    case "up":
                        laser_coords.push([Player_Info[data].x,Player_Info[data].y-32,"up"]);
                        Player_Info[data].cd++;
                        break;
                    case "down":
                        laser_coords.push([Player_Info[data].x,Player_Info[data].y+32,"down"]);
                        Player_Info[data].cd++;
                }
                Player_Info[data].energy-=2;
            }
        }
    });
    socket.on("Move",function(data){
        if(data[0]){
            if(data[1]=="idle"){
                if(Player_Info[data[0]].energy<10){
                    Player_Info[data[0]].energy+=0.05;
                    io.sockets.emit("updatePlayerCoords", Player_Info);
                }
            }
            else if(Player_Info[data[0]].energy>0){
                New=CheckCollision(data[1], Player_Info[data[0]].x, Player_Info[data[0]].y, data[0], false);
                if(Array.isArray(New)){
                    for(var i in Base_Coords[data[0]]){
                        if((Base_Coords[data[0]][i][0]==New[0]&&Base_Coords[data[0]][i][1]==New[1]) && Player_Info[data[0]].gold){
                            Player_Info[data[0]].points++;
                            Player_Info[data[0]].gold=false;
                            io.sockets.emit("updatePlayerCoords", Player_Info);
                            io.sockets.emit("AnnouncePoint",data[0]);
                            if(Player_Info[data[0]].points==5){
                                io.sockets.emit("AnnounceWinner",data[0]);
                                Game = false;
                            }
                        }
                    }
                }
                if(New===true){
                    if(Player_Info[data[0]].boost==0){
                        Player_Info[data[0]].energy-=0.05;
                    }
                    io.sockets.emit("updatePlayerCoords", Player_Info);
                }
            }
        }
    });
    socket.on("AskResources",function(){
        io.sockets.emit("GetResCoords",[Gold_coords, Power_Coords,laser_coords]);
    });
    }
);





function CheckCollision(direction, x, y, color, laser){
    var i;
switch(direction){
    case "up":
        if(y<=0){
            return false;
        }
        for(i = 0; i<Constant_Taken_Positions.length-4;i++){
            if (C_Up([Constant_Taken_Positions[i][0],Constant_Taken_Positions[i][1],x,y],laser)) {
                    if(!laser){return Constant_Taken_Positions[i];}
                    else{return false};
            }
        }
        for(i in Obstacle_coords){
            if (C_Up([Obstacle_coords[i][0],Obstacle_coords[i][1],x,y],laser)){
                    return false;
            }
        }
        for(i in Player_Info){
            if (i!=color && C_Up([Player_Info[i].x,Player_Info[i].y,x,y],laser)){
                if(laser){
                    return i;
                }
                return false;
            }
        }
        for(i in Gold_coords){
            if (C_Up([Gold_coords[i][0],Gold_coords[i][1],x,y],laser)){
                if(!laser){
                    {
                        if(!Player_Info[color].gold){
                            Gold_coords.splice(i,1);
                            Player_Info[color].gold=true;
                        }
                    }
                }
                else{
                    return false;
                }
            }
        }
        for(i in Power_Coords){
            if(C_Up([Power_Coords[i][0],Power_Coords[i][1],x,y],laser)){
                if(!laser){
                    Player_Info[color].boost+=5;
                    Power_Coords.splice(i,1);
                }
                else{
                    return false;
                }
            }
        }
        if(!laser){
            Player_Info[color].direction_draw="up";
            Player_Info[color].direction="up";
            Player_Info[color].y-=4;
        }
        break;  
    case "down":
        if(y>=736){
            return false;
        }
        for(i = 0; i<Constant_Taken_Positions.length-4;i++){
            if (C_Down([Constant_Taken_Positions[i][0],Constant_Taken_Positions[i][1],x,y],laser)) {
                    if(!laser){return Constant_Taken_Positions[i];}
                    else{return false};
                    
            }
        }
        for(i in Obstacle_coords){
            if (C_Down([Obstacle_coords[i][0],Obstacle_coords[i][1],x,y],laser)){
                    return false;
            }
        }
        for(i in Player_Info){
            if (i!=color && C_Down([Player_Info[i].x,Player_Info[i].y,x,y],laser)){
                if(laser){
                    return i;
                }
                return false;
            }
        }
        for(i in Gold_coords){
            if (C_Down([Gold_coords[i][0],Gold_coords[i][1],x,y],laser)){
                if(!laser){
                    {
                        if(!Player_Info[color].gold){
                            Gold_coords.splice(i,1);
                            Player_Info[color].gold=true;
                        }
                    }
                }
                else{
                    return false;
                }
            }
        }
        for(i in Power_Coords){
            if(C_Down([Power_Coords[i][0],Power_Coords[i][1],x,y],laser)){
                if(!laser){
                    Player_Info[color].boost+=5;
                    Power_Coords.splice(i,1);
                }
                else{
                    return false;
                }
            }
        }
        if(!laser){
            Player_Info[color].direction_draw="up";
            Player_Info[color].direction="down";
            Player_Info[color].y+=4;
        }
        break;  
    case "left":
        if(x<=0){
            return false;
        }
        for(i = 0; i<Constant_Taken_Positions.length-4;i++){
            if (C_Left([Constant_Taken_Positions[i][0],Constant_Taken_Positions[i][1],x,y],laser)) {
                    if(!laser){return Constant_Taken_Positions[i];}
                    else{return false};
            }
        }
        for(i in Obstacle_coords){
            if (C_Left([Obstacle_coords[i][0],Obstacle_coords[i][1],x,y],laser)){
                    return false;
            }
        }
        for(i in Player_Info){
            if (i!=color && C_Left([Player_Info[i].x,Player_Info[i].y,x,y],laser)){
                if(laser){
                    return i;
                }
                return false;
            }
        }
        for(i in Gold_coords){
            if (C_Left([Gold_coords[i][0],Gold_coords[i][1],x,y],laser)){
                if(!laser){
                    {
                        if(!Player_Info[color].gold){
                            Gold_coords.splice(i,1);
                            Player_Info[color].gold=true;
                        }
                    }
                }
                else{
                    return false;
                }
            }
        }
        for(i in Power_Coords){
            if(C_Left([Power_Coords[i][0],Power_Coords[i][1],x,y],laser)){
                if(!laser){
                    Player_Info[color].boost+=5;
                    Power_Coords.splice(i,1);
                }
                else{
                    return false;
                }
            }
        }
        if(!laser){
            Player_Info[color].direction_draw="left";
            Player_Info[color].direction="left";
            Player_Info[color].x-=4;
        }
        
        break;  
    case "right":
        if(x>=736){
            return false;
        }
        for(i = 0; i<Constant_Taken_Positions.length-4;i++){
            if (C_Right([Constant_Taken_Positions[i][0],Constant_Taken_Positions[i][1],x,y],laser)) {
                    if(!laser){return Constant_Taken_Positions[i];}
                    else{return false};
            }
        }
        for(i in Obstacle_coords){
            if (C_Right([Obstacle_coords[i][0],Obstacle_coords[i][1],x,y],laser)){
                    return false;
            }
        }
        for(i in Player_Info){
            if (i!=color && C_Right([Player_Info[i].x,Player_Info[i].y,x,y],laser)){
                if(laser){
                    return i;
                }
                return false;
            }
        }
        for(i in Gold_coords){
            if (C_Right([Gold_coords[i][0],Gold_coords[i][1],x,y],laser)){
                if(!laser){
                    {
                        if(!Player_Info[color].gold){
                            Gold_coords.splice(i,1);
                            Player_Info[color].gold=true;
                        }
                    }
                }
                else{
                    return false;
                }
            }
        }
        for(i in Power_Coords){
            if(C_Right([Power_Coords[i][0],Power_Coords[i][1],x,y],laser)){
                if(!laser){
                    Player_Info[color].boost+=5;
                    Power_Coords.splice(i,1);
                }
                else{
                    return false;
                }
            }
        }
        if(!laser){
            Player_Info[color].direction_draw="left";
            Player_Info[color].direction="right";
            Player_Info[color].x+=4;
        }
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