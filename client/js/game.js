var socket = io()

//Sign in related client code==========================
var signDiv = document.getElementById('signInDiv')
var signDivUsername = document.getElementById('signInDiv-username')
var signDivSignIn = document.getElementById('signInDiv-signIn')
var signDivSignUp = document.getElementById('signInDiv-signUp')
var signDivPassword = document.getElementById('signInDiv-password')
var gameDiv = document.getElementById('gameDiv')
var error = document.getElementById('err')

function randomRange(high, low) {
    return Math.random() * (high - low) + low;
}

//add event listeners for sign in buttons
signDivSignIn.onclick = function () {
    socket.emit('signIn', { username: signDivUsername.value, password: signDivPassword.value })
}
signDivSignUp.onclick = function () {
    socket.emit('signUp', { username: signDivUsername.value, password: signDivPassword.value })
}

socket.on('signInResponse', function (data) {
    if (data.success) {
        //log user in
        signDiv.style.display = "none"
        gameDiv.style.display = "inline-block"
    } else {
        //alert("Sign in Unsuccessful")
        error.innerHTML = "Sign in Unsuccessful"
    }

})

socket.on('signUpResponse', function (data) {
    if (data.success) {
        error.innerHTML = "Sign Up Success Please Login"
    } else {

        error.innerHTML = "Sign up Unsuccessful"
    }

})



//Game related code====================================
var canvas = document.getElementById('canvas')
var ctx = canvas.getContext('2d')
var chatText = document.getElementById('chat-text')
var chatInput = document.getElementById('chat-input')
var chatForm = document.getElementById('chat-form')
var px = 0
var py = 0
var clientId
ctx.font = '30px Arial'

var drawScore = function () {
    ctx.fillStyle = 'white'
    ctx.fillText(Player.list[clientId].score, 10, 50)
    ctx.fillStyle = 'black'
}




var Player = function (initPack) {
    var self = {}
    self.id = initPack.id
    self.number = initPack.number
    self.x = initPack.x
    self.y = initPack.y
    self.hp = initPack.hp
    self.hpMax = initPack.hpMax
    self.score = initPack.score
    self.up = false
    self.left = false
    self.right = false
    self.flamelength = 30
    self.color = GenColor();
    self.dead = false;

    console.log(initPack.dead);

    self.draw = function () {
        if(self.dead == false){
            ctx.save();
            ctx.translate(self.x, self.y);
            // draws afterburner flame
            if (self.up == true || self.left == true || self.right == true) {
                ctx.save();
                //animate flame
                if (self.flamelength == 30) {
                    self.flamelength = 10;
                }
                else {
                    self.flamelength = 30;
                }
                ctx.beginPath();
                ctx.fillStyle = "orange";
                ctx.moveTo(0, this.flamelength);
                ctx.lineTo(5, 5);
                ctx.lineTo(-5, 5);
                ctx.lineTo(0, this.flamelength);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.moveTo(0, -10);
            ctx.lineTo(10, 10);
            ctx.lineTo(-10, 10);
            ctx.lineTo(0, -10);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }

    }

    Player.list[self.id] = self
    return self

}

Player.list = {}

var Asteroids = function (initPack) {
    var self = {}
    self.id = initPack.id
    self.x = initPack.x
    self.y = initPack.y
    self.radius = initPack.radius
    // self.vx = randomRange(-5,-10)
    //self.vy = initPack.vy
    self.color = "white";

    self.draw = function () {
        ctx.save();
        //draws original circles for asteroids
        ctx.beginPath();
        ctx.fillStyle = self.color;
        ctx.arc(self.x, self.y, self.radius, 0, 2 * Math.PI, true);
        ctx.closePath();
        ctx.fill();
        //ctx.drawImage(cookieSprite,this.x - this.radius,this.y-this.radius,this.radius*2, this.radius*2)
        ctx.restore();
    }

    Asteroids.list[self.id] = self
    return self

}

Asteroids.list = {}


socket.on('connected', function (data) {
    clientId = data
    console.log(clientId)
})

//int update remove

//init
socket.on('init', function (data) {
    for (var i = 0; i < data.player.length; i++) {
        new Player(data.player[i])
    }

    for (var i = 0; i < data.asteroid.length; i++) {
        new Asteroids(data.asteroid[i])
    }

})

//update
socket.on('update', function (data) {
    //console.log(data)//!
    var a;
    var p;
    var playerNum = 0;

    //sets player position
    for (var i = 0; i < data.player.length; i++) {
        //ctx.fillText(data.player[i].number, data.player[i].x, data.player[i].y);
        var pack = data.player[i]
        p = Player.list[pack.id]

        if (clientId == data.player[i].id) {
            px = data.player[i].x
            py = data.player[i].y
        }
        if (p) {
            if (pack.x !== undefined) {
                p.x = pack.x
            }
            if (pack.y !== undefined) {
                p.y = pack.y
            }
            if (pack.hp !== undefined) {
                p.hp = pack.hp
            }
            if (pack.hpMax !== undefined) {
                p.hpMax = pack.hpMax
            }
            if (pack.score !== undefined) {
                p.score = pack.score
            }
            if(p.dead == false)playerNum++;
            if(p.dead == true){

                
            }
            //console.log("P", p.id, ":", p.x, ",", p.y);
        }

        
        if(playerNum <= 0){
            location.replace("/DeathScreen")
        }
    }
    console.log("# of Players:", playerNum, "(Alive)");

    for (var i = 0; i < data.asteroid.length; i++) {
        var pack = data.asteroid[i]
        a = Asteroids.list[pack.id]
        if (a) {
            if (pack.x !== undefined) {
                a.x = pack.x
            }
            if (pack.y !== undefined) {
                a.y = pack.y
            }

            //console.log("A", a.id, ":", a.x, ",", a.y);
        }
    }

    for (var i = 0; i < data.asteroid.length; i++) {
        for (var k = 0; k < data.player.length; k++) {
            a = Asteroids.list[data.asteroid[i].id];
            p = Player.list[data.player[k].id];

            var dist = GetDistance(a,p);//collision detection (players check for asteroids)
                if(dist < 10 && p.dead == false){
                    p.dead = true;
                    pack.dead = true;
                    console.log("Player", clientId, "Dead!")
                }
            }
        }

})

function GetDistance(a, b) {
    var aCalc = (a.x - b.x);
    var bCalc = (a.y - b.y);

    aCalc = aCalc * aCalc;//^2
    bCalc = bCalc * bCalc;//^2

    var calc = aCalc+bCalc;

    var dist = Math.sqrt(calc);

    return dist;
} 

function GenColor(){
    var hexCode = "0123456789ABCDEF";
    var color = "#";
    for (let i = 0; i < 6; i++)
         color += hexCode[Math.floor(Math.random() * 16)];
    
    //console.log(color);

    return color;
}

//remove
socket.on('remove', function (data) {
    for (var i = 0; i < data.player.length; i++) {
        delete Player.list[data.player[i]]
    }

})

setInterval(function () {
    if (!clientId)
        return;
    ctx.clearRect(0, 0, 800, 600)
    for (var i in Player.list) {
        //Draw functions will go here
        Player.list[i].draw()
    }

    for (var i in Asteroids.list) {
        //Draw functions will go here
        Asteroids.list[i].draw()
    }
    drawScore()
}, 1000 / 30)

//event listeners for keypresses and mouse clicks and mouse posiition
document.addEventListener('keydown', keyPressDown)
document.addEventListener('keyup', keyPressUp)

function keyPressDown(e) {
    if (e.keyCode === 68)//right
        socket.emit('keypress', { inputId: 'right', state: true })
    else if (e.keyCode === 65)//left
        socket.emit('keypress', { inputId: 'left', state: true })
    else if (e.keyCode === 87)//up
        socket.emit('keypress', { inputId: 'up', state: true })
    else if (e.keyCode === 83)//down
        socket.emit('keypress', { inputId: 'down', state: true })
}

function keyPressUp(e) {

    if (e.keyCode === 68)//right
        socket.emit('keypress', { inputId: 'right', state: false })
    else if (e.keyCode === 65)//left
        socket.emit('keypress', { inputId: 'left', state: false })
    else if (e.keyCode === 87)//up
        socket.emit('keypress', { inputId: 'up', state: false })
    else if (e.keyCode === 83)//down
        socket.emit('keypress', { inputId: 'down', state: false })
}

socket.on('addToChat', function (data) {
    chatText.innerHTML += `<div>${data}</div>`
})

socket.on('evalResponse', function (data) {
    chatText.innerHTML += `<div>${data}</div>`
    console.log(data)
})

chatForm.onsubmit = function (e) {
    e.preventDefault()

    if (chatInput.value[0] === '/') {
        socket.emit('evalServer', chatInput.value.slice(1))
    } else {
        socket.emit('sendMessageToServer', chatInput.value)
    }
    //clear out the input field
    chatInput.value = ""
}