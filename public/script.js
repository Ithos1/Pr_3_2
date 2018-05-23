
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
    var canvas = createCanvas(768, 768);
    canvas.parent('Canvas_Holder');
    background(111,111,111);
}