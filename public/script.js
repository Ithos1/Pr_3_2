var Color;
var Coords;
var socket;
var Obstacles;
var images;
var Gold_Coords;

function preload(){ 

    socket = io.connect('http://localhost:3000');
    var chatDiv = document.getElementById('chat_1_text');
    var input = document.getElementById('message');
    var S_button = document.getElementById('submit');
    var Server_chat = document.getElementById('chat_2_text');
    var Msg_sent = true;
    
    function handleSubmit(evt) {
        var val = input.value;
        input.value = "";
        if (val != "") {
            socket.emit("send message", val, This_Player);
        }
    }
    S_button.onclick = handleSubmit;

    function handleMessage(msg) {
   		var p = document.createElement('p');
        p.setAttribute("class", "message");
   		p.innerText = msg;
   		chatDiv.appendChild(p);

    }
    socket.on('display message', handleMessage);

    function handleAnnounce(msg) {
   		var p = document.createElement('p');
        p.setAttribute("class", "message");
   		p.innerText = msg+" has joined";
   		Server_chat.appendChild(p);
    }
    socket.on('Announce_Player', handleAnnounce);

    function handleMessageStart(msg){
        if(Msg_sent){
            for(var i in msg){
                var p = document.createElement('p');
                p.setAttribute("class", "message");
                p.innerText = msg[i];
                chatDiv.appendChild(p);
                input.value = "";
            }
            Msg_sent = false;
        }
    }
    socket.on('display message start', handleMessageStart);

    function Taken(){
        var New;
        New = prompt("Enter your nickname");
        while(New==This_Player){
            New = prompt("Enter your nickname");
        }
        This_Player = New;
        socket.emit("AddPlayer", This_Player);
    }
    socket.on("Taken",Taken);
    
    var This_Player = prompt("Enter your nickname");
    socket.emit("AddPlayer", This_Player);
    
    function ReceiveObstacles(data){
        Obstacles = data;
    }
    
    socket.on("ReceiveObstacles", ReceiveObstacles);

    function UpdatePlayerCoords(data){
        Coords = data;
    }

    socket.on("updatePlayerCoords", UpdatePlayerCoords);

    function GetColor (data){
        Color = data;
    }
       
    socket.on("GetColor", GetColor);

    function GetGold(data){
        Gold_Coords=data;
    }
    socket.on("GetGoldCoords", GetGold);
}

function setup(){
    //load all images
    var x = "gui/Resources/";
    images = {
        grass:loadImage(x+"grass.png"),
        B_blue:loadImage(x+"camp_blue.png"),
        B_red:loadImage(x+"camp_red.png"),
        B_yellow:loadImage(x+"camp_yellow.png"),
        B_green:loadImage(x+"camp_green.png"),
        Gold:loadImage(x+"gold.png"),
        Obstacle:loadImage(x+"obstacle_1.png"),
        Red_Truck_Up:loadImage(x+"player_red_3.png"),
        Red_Truck_Left:loadImage(x+"player_red_4.png"),
        Red_Truck_Down:loadImage(x+"player_red_1.png"),
        Red_Truck_Right:loadImage(x+"player_red_2.png"),
        Green_Truck_Up:loadImage(x+"player_green_3.png"),
        Green_Truck_Left:loadImage(x+"player_green_4.png"),
        Green_Truck_Down:loadImage(x+"player_green_1.png"),
        Green_Truck_Right:loadImage(x+"player_green_2.png"),
        Yellow_Truck_Up:loadImage(x+"player_yellow_3.png"),
        Yellow_Truck_Left:loadImage(x+"player_yellow_4.png"),
        Yellow_Truck_Down:loadImage(x+"player_yellow_1.png"),
        Yellow_Truck_Right:loadImage(x+"player_yellow_2.png"),
        Blue_Truck_Up:loadImage(x+"player_blue_3.png"),
        Blue_Truck_Left:loadImage(x+"player_blue_4.png"),
        Blue_Truck_Down:loadImage(x+"player_blue_1.png"),
        Blue_Truck_Right:loadImage(x+"player_blue_2.png"),
        Cargo_Gold:loadImage(x+"cargo_gold_2.png")


    };
    var canvas = createCanvas(960, 960);
    canvas.parent('Canvas_Holder');
    background(75,75,75);
    stroke('rgba(0,0,255,0.25)');
    strokeWeight(4);
    fill(0,175,0);
    rect(96,96,768,768);

}

function draw(){

    socket.emit("AskGold");
    
    background(75,75,75);
    rect(96,96,768,768);    

    for(var i = 0;i<24;i++){
        for(var j =0;j<24;j++){
            image(images.grass, (96+32*i), (96+32*j),32,32);
        }
    }
    image(images.B_blue, 96,96);
    
    image(images.B_red, 96, (96+736-32));

    image(images.B_green, 704+96, 96);

    image(images.B_yellow, 704+96, 704+96);



    for( i in Obstacles){
        image(images.Obstacle, Obstacles[i][0]+96,Obstacles[i][1]+96);
    }

    for( i in Coords){
        image(images.Red_Truck_Left, Coords[i][0]+96, Coords[i][1]+96);
        if(Coords[i][2]){
            image(images.Cargo_Gold, Coords[i][0]+96, Coords[i][1]+84);
        }
    }

    for( i in Gold_Coords){
        image(images.Gold, Gold_Coords[i][0]+96, Gold_Coords[i][1]+96);
    }
    
//Controls
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
        socket.emit("Move",[Color, "left"]);
        console.log("left");
    }
    
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
        socket.emit("Move",[Color, "right"]);
        console.log("right");
    }
    
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) {
        socket.emit("Move",[Color, "up"]);
        console.log("up");
    }
    
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) {
        socket.emit("Move",[Color, "down"]);
        console.log("down");
    }
}


