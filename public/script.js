var Color;
var Players_info;
var socket;
var Obstacles;
var images;
var Gold_Coords;
var Background;
var Game_Has_Started = false;

function preload() {
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
        p.innerText = msg + " has joined";
        Server_chat.appendChild(p);
    }
    socket.on('Announce_Player', handleAnnounce);

    function handleMessageStart(msg) {
        if (Msg_sent) {
            for (var i in msg) {
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

    function Taken() {
        var New;
        New = prompt("Enter your nickname");
        while (New == This_Player) {
            New = prompt("Enter your nickname");
        }
        This_Player = New;
        socket.emit("AddPlayer", This_Player);
    }
    socket.on("Taken", Taken);

    var This_Player = prompt("Enter your nickname");
    socket.emit("AddPlayer", This_Player);

    function ReceiveObstacles(data) {
        Obstacles = data[0];
        Background = "bg_" + data[1];

    }

    socket.on("ReceiveObstacles", ReceiveObstacles);

    function UpdatePlayerCoords(data) {
        Players_info = data;
    }

    socket.on("updatePlayerCoords", UpdatePlayerCoords);

    function GetColor(data) {
        Color = data;
    }

    socket.on("GetColor", GetColor);

    function GetGold(data) {
        Gold_Coords = data;
    }
    socket.on("GetGoldCoords", GetGold);

    function AnnouncePoint(data) {
        var p = document.createElement('p');
        p.setAttribute("class", "message");
        p.innerText = "<span style='color:"+data+">"+data + "</span> delievered the cargo and now has " + Players_info[data][3] + " points";
        Server_chat.appendChild(p);
    }

    socket.on("AnnouncePoint", AnnouncePoint);

    function Start(){
        Game_Has_Started = true;
        var p = document.createElement('p');
        p.setAttribute("class", "message");
        p.innerText = "You are <span style='color:"+Color+"'>"+Color+"</span>!";
        Server_chat.appendChild(p);
    }

    socket.on("Start",Start);
}

function setup() {
    //load all images
    var x = "gui/Resources/";
    images = {
        bg_1: loadImage(x + "grass.png"),
        bg_2: loadImage(x + "mars.png"),
        bg_3: loadImage(x + "moon.png"),
        bg_4: loadImage(x + "ice.png"),
        B_blue: loadImage(x + "camp_blue.png"),
        B_red: loadImage(x + "camp_red.png"),
        B_yellow: loadImage(x + "camp_yellow.png"),
        B_green: loadImage(x + "camp_green.png"),
        Gold: loadImage(x + "gold.png"),
        Obstacle: loadImage(x + "obstacle_1.png"),
        red_Truck_up: loadImage(x + "player_red_3.png"),
        red_Truck_left: loadImage(x + "player_red_4.png"),
        green_Truck_up: loadImage(x + "player_green_3.png"),
        green_Truck_left: loadImage(x + "player_green_4.png"),
        yellow_Truck_up: loadImage(x + "player_yellow_3.png"),
        yellow_Truck_left: loadImage(x + "player_yellow_4.png"),
        blue_Truck_up: loadImage(x + "player_blue_3.png"),
        blue_Truck_left: loadImage(x + "player_blue_4.png"),
        Cargo_Gold_left: loadImage(x + "cargo_gold_2.png"),
        Cargo_Gold_up: loadImage(x+ "cargo_gold_1.png"),
        Power: loadImage(x+"power.png")


    };
    var canvas = createCanvas(960, 960);
    canvas.parent('Canvas_Holder');
    background(75, 75, 75);
    stroke('rgba(0,0,255,0.25)');
    strokeWeight(4);
    fill(0, 175, 0);
    rect(96, 96, 768, 768);

}
var temp;
function draw() {


    socket.emit("AskGold");
    background(75, 75, 75);
    rect(96, 96, 768, 768);
    
    
    
    if(Color){
        temp=Players_info[Color][4];
        for (var i = 0; i<temp;i++){
            image(images.Power, 108+i*48, 48);
        }
        image(images.Power, 108+i*48, 48, 32, 32);
    }
    

    for (var i = 0; i < 24; i++) {
        for (var j = 0; j < 24; j++) {
            if (images[Background]) {
                image(images[Background], (96 + 32 * i), (96 + 32 * j), 32, 32);
            }
        }
    }
    image(images.B_blue, 96, 96);

    image(images.B_red, 96, (96 + 736 - 32));

    image(images.B_green, 704 + 96, 96);

    image(images.B_yellow, 704 + 96, 704 + 96);



    for (i in Obstacles) {
        image(images.Obstacle, Obstacles[i][0] + 96, Obstacles[i][1] + 96);
    }

    for (i in Players_info) {
        temp = i+"_Truck_"+Players_info[i][5];
        image(images[temp], Players_info[i][0] + 96, Players_info[i][1] + 96);
        if (Players_info[i][2]) {
            temp = "Cargo_Gold_"+Players_info[i][5];
            if(Players_info[i][5]=="left"){
            image(images[temp], Players_info[i][0] + 96, Players_info[i][1] + 84);
            }
            else{
                image(images[temp], Players_info[i][0] + 84, Players_info[i][1] + 96);
            }
        }
    }
    
    for (i in Gold_Coords) {
        image(images.Gold, Gold_Coords[i][0] + 96, Gold_Coords[i][1] + 96);
    }

    

    
    if(Game_Has_Started){
        //Controls
        if (keyIsPressed){
            if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
                socket.emit("Move", [Color, "left"]);
            }

            if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
                socket.emit("Move", [Color, "right"]);
            }

            if (keyIsDown(UP_ARROW) || keyIsDown(87)) {
                socket.emit("Move", [Color, "up"]);
            }

            if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) {
                socket.emit("Move", [Color, "down"]);
            }
        }
        else{
            socket.emit("Move", [Color, "idle"]);
        }
    }
}


