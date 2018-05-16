
window.onload = function(){ 
    var socket = io.connect('http://localhost:3000');
    var chatDiv = document.getElementById('chat_1_text');
    var input = document.getElementById('message');
    var S_button = document.getElementById('submit');
    var Msg_sent = true;
    
    function handleSubmit(evt) {
        var val = input.value;
        if (val != "") {
            socket.emit("send message", val);
        }
    }
    S_button.onclick = handleSubmit;

    function handleMessage(msg) {
   		var p = document.createElement('p');
        p.setAttribute("class", "message");
   		p.innerText = msg;
   		chatDiv.appendChild(p);
   		input.value = "";
    }
    socket.on('display message', handleMessage);

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
            console.log("done");
        }
    }
    socket.on('display message start', handleMessageStart);
    
    /*var This_Player = prompt("Enter your nickname");
    socket.emit("AddPlayer", This_Player);*/
    
    function setup() {
        var canvas = createCanvas(768, 768);
        canvas.parent('Canvas_Holder');
        background(111,111,111);
    
    }
};
