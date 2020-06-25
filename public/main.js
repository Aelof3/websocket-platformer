(function () {
    var socket = io();

    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

    window.requestAnimationFrame = requestAnimationFrame;

    function uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
      // limit the number of events per second
    function throttle(callback, delay) {
        var previousCall = new Date().getTime();
        return function() {
            var time = new Date().getTime();

            if ((time - previousCall) >= delay) {
                previousCall = time;
                callback.apply(null, arguments);
            }
        };
    }

    class PLAYER{
        constructor( data ){

            this.id = data.id;
            this.x = data.x || 100;
            this.y = data.y || 600;
            this.width = data.width || 25;
            this.height = data.height || 25;
            this.speed = data.speed || 4;
            this.velX = data.velX || 0;
            this.velY = data.velY || 0;
            this.jumping = data.jumping || false;
            this.grounded = data.grounded || false;
            this.color = data.color || '#fff';
            this.keys = [];
            this.eventHandlers();
        }

        eventHandlers( ){
            let self = this;
            this.update = setInterval(()=>{socket.emit('playermove', self)}, 10);
            window.addEventListener("keydown", ( e ) => {
                self.keys[e.keyCode] = true;
            }, false);
            window.addEventListener("keyup", ( e ) => {
                self.keys[e.keyCode] = false;
            }, false);

            let buttonleft = document.getElementById("buttonleft");
            let buttonright = document.getElementById("buttonright");
            let buttonup = document.getElementById("jumpbutton");
            
            
            
            buttonleft.addEventListener("mousedown", ( e ) => {
                self.keys[37] = true;
            }, false);
            buttonleft.addEventListener("touchstart", ( e ) => {
                self.keys[37] = true;
            }, false);
            buttonleft.addEventListener("mouseup", ( e ) => {
                self.keys[37] = false;
            }, false);
            buttonleft.addEventListener("touchend", ( e ) => {
                self.keys[37] = false;
            }, false);
            
            buttonright.addEventListener("mousedown", ( e ) => {
                self.keys[39] = true;
            }, false);
            buttonright.addEventListener("touchstart", ( e ) => {
                self.keys[39] = true;
            }, false);
            buttonright.addEventListener("mouseup", ( e ) => {
                self.keys[39] = false;
            }, false);
            buttonright.addEventListener("touchend", ( e ) => {
                self.keys[39] = false;
            }, false);
            
            buttonup.addEventListener("mousedown", ( e ) => {
                self.keys[38] = true;
            }, false);
            buttonup.addEventListener("touchstart", ( e ) => {
                self.keys[38] = true;
            }, false);
            buttonup.addEventListener("mouseup", ( e ) => {
                self.keys[38] = false;
            }, false);
            buttonup.addEventListener("touchend", ( e ) => {
                self.keys[38] = false;
            }, false);
        }

    }

    class PLATFORM{
        constructor( data ){
            this.desc = data.desc;
            this.x = data.x;
            this.y = data.y;
            this.width = data.width;
            this.height = data.height;
            this.color = data.color || '#aad';
        }
    }


    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var width = 1000;
    var height = 800;
    var player = new PLAYER({
        id: uuidv4(),
        x: width / 2, //starting right in the middle
        y: 600
    });
    var friction = 0.8;
    var gravity = 0.4;
    var platforms = [];
    var otherplayers = {};

    platforms.push( new PLATFORM({
        desc: 'Wall - left',
        x: 0,
        y: 0,
        width: 10,
        height: height
    }));
    platforms.push( new PLATFORM({
        desc: 'Floor',
        x: 0,
        y: height - 10,
        width: width,
        height: 50
    }));
    platforms.push( new PLATFORM({
        desc: 'Wall - Right',
        x: width - 10,
        y: 0,
        width: 50,
        height: height
    }));
    platforms.push( new PLATFORM({
        desc: '',
        x: 120,
        y: 275,
        width: 150,
        height: 10
    }));
    platforms.push( new PLATFORM({
        desc: '',
        x: 290,
        y: 200,
        width: 260,
        height: 10,
    }));
    platforms.push( new PLATFORM({
        desc: '',
        x: 340,
        y: 350,
        width: 90,
        height: 10
    }));
    platforms.push( new PLATFORM({
        desc: '',
        x: 590,
        y: 120,
        width: 80,
        height: 10
    }));
    platforms.push( new PLATFORM({ 
        desc: '',
        x: 740,
        y: 300,
        width: 160,
        height: 10
    }));
    platforms.push( new PLATFORM({
        desc: '',
        x: 120,
        y: 600,
        width: 150,
        height: 10
    }));
    platforms.push( new PLATFORM({
        desc: '',
        x: 290,
        y: 525,
        width: 260,
        height: 10
    }));
    platforms.push( new PLATFORM({
        desc: '',
        x: 340,
        y: 675,
        width: 90,
        height: 10
    }));
    platforms.push( new PLATFORM({ 
        desc: '',
        x: 590,
        y: 445,
        width: 80,
        height: 10
    }));
    platforms.push( new PLATFORM({ 
        desc: '',
        x: 740,
        y: 625,
        width: 160,
        height: 10
    }));

    canvas.width = width;
    canvas.height = height;

    

    window.addEventListener("load", onLoadFunc, false);

    socket.on( 'playermove', onPlayerMoveEvent );


    function update() {
        // check keys
        if (player.keys[38] || player.keys[32] || player.keys[87]) {
            // up arrow or space
            if (!player.jumping && player.grounded) {
                player.jumping = true;
                player.grounded = false;
                player.velY = -player.speed * 2.5;//how high to jump
            }
        }
        if (player.keys[39] || player.keys[68]) {
            // right arrow
            if (player.velX < player.speed) {
                player.velX++;
            }
        }
        if (player.keys[37] || player.keys[65]) {
            // left arrow
            if (player.velX > -player.speed) {
                player.velX--;
            }
        }
    
        

        player.velX *= friction;
        player.velY += gravity;
    

        ctx.clearRect(0, 0, width, height);
        ctx.beginPath();
        
        player.grounded = false;
        for (var i = 0; i < platforms.length; i++) {//draw platforms
            ctx.fillStyle = platforms[i].color;
            ctx.rect(platforms[i].x, platforms[i].y, platforms[i].width, platforms[i].height);
            
            var dir = colCheck(player, platforms[i]);

            if (dir === "l" || dir === "r") {
                player.velX = 0;
                player.jumping = false;
            } else if (dir === "b") {
                player.grounded = true;
                player.jumping = false;
            } else if (dir === "t") {
                player.velY *= -1;
            }

        }
        
        for (var person in otherplayers) {//draw other players
            if (person !== player.id){
                ctx.fillStyle = otherplayers[person].color;
                ctx.rect(otherplayers[person].x, otherplayers[person].y, 25, 25);    
            }
            
        }
        
        if(player.grounded){
            player.velY = 0;
        }
        
        player.x += player.velX;
        player.y += player.velY;

    
        ctx.fill();//Draw charater stuff
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
        

        requestAnimationFrame(update);
    }

    //collision check
    function colCheck(shapeA, shapeB) {
        // get the vectors to check against
        var vX = (shapeA.x + (shapeA.width / 2)) - (shapeB.x + (shapeB.width / 2)),
            vY = (shapeA.y + (shapeA.height / 2)) - (shapeB.y + (shapeB.height / 2)),
            // add the half widths and half heights of the objects
            hWidths = (shapeA.width / 2) + (shapeB.width / 2),
            hHeights = (shapeA.height / 2) + (shapeB.height / 2),
            colDir = null;

        // if the x and y vector are less than the half width or half height, they we must be inside the object, causing a collision
        if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
            // figures out on which side we are colliding (top, bottom, left, or right)
            var oX = hWidths - Math.abs(vX),
                oY = hHeights - Math.abs(vY);
            if (oX >= oY) {
                if (vY > 0) {
                    colDir = "t";
                    shapeA.y += oY;
                } else {
                    colDir = "b";
                    shapeA.y -= oY;
                }
            } else {
                if (vX > 0) {
                    colDir = "l";
                    shapeA.x += oX;
                } else {
                    colDir = "r";
                    shapeA.x -= oX;
                }
            }
        }
        return colDir;
    }


    /////////////////////////////////////////////////////////////////////
    // EVENT HANDLER DEFINITIONS ////////////////////////////////////////




        function onLoadFunc( ){
            update();
        }

        function onPlayerMoveEvent( movingplayer ){
            otherplayers[movingplayer.id] = movingplayer;
        }
        


})();
