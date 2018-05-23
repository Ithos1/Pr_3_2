
function preload(){ 

    




    var socket = io.connect('http://localhost:3000');
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
    
        
}

function setup(){
    //load all images
    var x = "gui/Resources/";
    var images = {
        grass:loadImage(x+"grass.png"),
        B_blue:loadImage(x+"camp_blue.png"),
        B_red:loadImage(x+"camp_red.png"),
        B_yellow:loadImage(x+"camp_yellow.png"),
        B_green:loadImage(x+"camp_green.png"),
        Gold:loadImage(x+"gold.png"),
        Obstacle:loadImage(x+"obstacle_1.png")

    };
    var canvas = createCanvas(960, 960);
    canvas.parent('Canvas_Holder');
    background(75,75,75);
    stroke('rgba(0,0,255,0.25)');
    strokeWeight(4);
    fill(0,175,0);
    rect(96,96,768,768);
    for(var i = 0;i<24;i++){
        for(var j =0;j<24;j++){
            image(images.grass, (96+32*i), (96+32*j),32,32);
        }
    }
    fill(0,0,255);
    rect(96,96,64,64);
    image(images.B_blue, 96,96);
    
    fill(255,0,0);
    rect(96, 96+736-32,64,64);
    image(images.B_red, 96, (96+736-32));

}

function draw(){

}