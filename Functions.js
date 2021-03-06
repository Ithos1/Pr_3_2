module.exports = {
    
Rand:function(A=1,B=0){
    if(Array.isArray(A)){
        var New = Math.round(Math.random()*(A.length-1));
        return A[New];
    }
    else{
        if(B>A){
            return ((Math.round(Math.random()*B))+A);
        }
        else{
            return ((Math.round(Math.random()*A))+B);
        }
    }
},

Collis_D:function(coords, laser){
        var obstacleX = coords[0];
        var obstacleY = coords[1];
    
        var playerOX = coords[2] + 16;
        var playerOY = coords[3] + 16;
    
        var objectOX = obstacleX + 16;
        var objectOY = obstacleY + 16;
        var side = 32;
        if(laser){
            side = 12;
        }
    
        if (objectOY - playerOY <= 32 && objectOY - playerOY >= 0) {
            if (Math.abs(playerOX - objectOX) < side) {
                return true;
            }
        }
        return false;
},

Collis_U:function(coords, laser){
        var obstacleX = coords[0];
        var obstacleY = coords[1];
    
        var playerOX = coords[2] + 16;
        var playerOY = coords[3] + 16;
    
        var objectOX = obstacleX + 16;
        var objectOY = obstacleY + 16;
        var side = 32;
        if(laser){
            side = 12;
        }

    if (playerOY - objectOY <= 32 && playerOY - objectOY >= 0) {
        if (Math.abs(playerOX - objectOX) < side) {
            return true;
        }
    }
    return false;
},

Collis_L:function(coords, laser){
    var obstacleX = coords[0];
    var obstacleY = coords[1];

    var playerOX = coords[2] + 16;
    var playerOY = coords[3] + 16;

    var objectOX = obstacleX + 16;
    var objectOY = obstacleY + 16;
    var side = 32;
        if(laser){
            side = 12;
        }

    if (playerOX - objectOX <= 32 && playerOX - objectOX >= 0) {
        if (Math.abs(playerOY - objectOY) < side) {
            return true;
        }
    }
    return false;
},

Collis_R:function(coords, laser){
    var obstacleX = coords[0];
    var obstacleY = coords[1];

    var playerOX = coords[2] + 16;
    var playerOY = coords[3] + 16;

    var objectOX = obstacleX + 16;
    var objectOY = obstacleY + 16;
    var side = 32;
        if(laser){
            side = 12;
        }

    if (objectOX - playerOX <= 32 && objectOX - playerOX >= 0) {
        if (Math.abs(playerOY - objectOY) < side) {
            return true;
        }
    }
    return false;
}






}