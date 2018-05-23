module.exports = function Random(A=1,B=0){
        if(typeof(A)==Array){
            return A[Math.round(Math.random()*A.length)];
        }
        else{
            if(B>A){
                return ((Math.round(Math.random()*B))+A);
            }
            else{
                return ((Math.round(Math.random()*A))+B);
            }
        }
    }