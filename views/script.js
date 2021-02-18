//var socket = io();//!how to implement w/out errors?

var c = document.querySelector("canvas");
var ctx = c.getContext("2d");
var timer = requestAnimationFrame(main);
var gravity = 1;
var asteroids = new Array();
var numAsteroids = 10;
var gameOver = true;
var score = 0;
var gameStates = [];
var currentState = 0;
var ship;
var ship2;
var highScore = 0;
//console.log("highscore reset");
var bgMain = new Image();
var cookieSprite = new Image();
var highScoreElements = document.querySelector('.highscore');

bgMain.src = "images/rocks.jpg";
cookieSprite.src = "images/cookie.png";

//event listener to trigger main when image is loaded
bgMain.onload = function(){
    main();
}

cookieSprite.onload = function(){
    main();
}

function randomRange(high, low){
    return Math.random() * ( high - low) + low;
}

//Asteroids GameObject Class
function Asteroids(){
    this.radius = randomRange(15,2);
    this.x = randomRange(0 + this.radius, c.width - this.radius); 
    this.y = randomRange(0 + this.radius, c.height - this.radius)- c.height;
    this.vx = randomRange(-5,-10);
    this.vy = randomRange(10,5);
    this.color = "white";

    this.draw = function(){
        ctx.save();
        //draws original circles for asteroids
        /*ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x,this.y, this.radius, 0, 2*Math.PI,true);
        ctx.closePath();
        ctx.fill();*/
        ctx.drawImage(cookieSprite,this.x - this.radius,this.y-this.radius,this.radius*2, this.radius*2)
        ctx.restore();
    }
}



//class for player ship
function PlayerShip(color){
    this.x = c.width/2;
    this.y = c.height/2;
    this.w = 20;
    this.h = 20;
    this.vx = 0;
    this.vy = 0;
    this.up = false;
    this.left = false;
    this.right = false;
    this.flamelength = 30;
    this.dead = false;

    this.draw = function(){
        ctx.save();
        ctx.translate(this.x,this.y);

        // draws afterburner flame
        if(this.up == true ||  this.left == true || this.right == true){
            ctx.save();
            //animate flame
            if(this.flamelength == 30){
                this.flamelength = 10;
            }
            else{
                this.flamelength = 30;
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
        ctx.fillStyle = color;
        ctx.moveTo(0, -10);
        ctx.lineTo(10, 10);
        ctx.lineTo(-10, 10);
        ctx.lineTo(0, -10);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    this.move = function(){
        this.x += this.vx;
        this.y += this.vy;

        if(this.y > c.height - 10){
            this.y = c.height - 10;
            this.vy = 0;
        }
        //right boundary of screen
        if(this.x > c.width - 10 ){
            this.x = c.width - 10;
            this.vx = 0;
        }
        //left boundary of screen
        if(this.x < 0 + 10 ){
            this.x = 0 + 10;
            this.vx = 0;
        }

        //top boundary of screen
        if(this.y < 0 + 10){
            this.y = 0 + 10;
            this.vy = 0;
        }
    }

}

function gameStart() {
    //for loop to create all instances of asteroids
    for (var i = 0; i < numAsteroids; i++) {
        asteroids[i] = new Asteroids();
    }
    //this creates an instance of the ship
    ship = new PlayerShip("blue");//p1 is blue
    //custom attributes for p1
    
    ship2 = new PlayerShip("red");//p2 is red
    //custom attributes for p2
    ship2.up = true;//!added to temporarily separate players
    //!Note:P2 works properly, but is under P1

    // //connect to server
    // socket.on('connected', function(data){
    //     clientId = data;
    //     console.log(clientId);
    // })
}



//adding event listeners
document.addEventListener("keydown", keyPressDown);
document.addEventListener("keyup", keyPressUp);

function keyPressUp(e){
  //  console.log("Key released " + e.keyCode);
    if(gameOver == false){
        //p1
        if(e.keyCode === 38){
            ship.up = false;
        }
        if(e.keyCode === 37){
            ship.left = false;
        }
        if(e.keyCode === 39){
            ship.right = false;
        }
        //p2
        if(e.keyCode === 38){
            ship2.up = false;
        }
        if(e.keyCode === 37){
            ship2.left = false;
        }
        if(e.keyCode === 39){
            ship2.right = false;
        }
    }
    
}

function keyPressDown(e){
    //console.log("Key pressed " + e.keyCode);
    if(gameOver == false){
        //p1
        if(e.keyCode === 38){
            ship.up = true;
        }
        if(e.keyCode === 37){
            ship.left = true;
        }
        if(e.keyCode === 39){
            ship.right = true;
        }
        if(e.keyCode === 38){
            ship.up = true;
        }
        //p2
        if(e.keyCode === 38){
            ship2.up = true;
        }
        if(e.keyCode === 37){
            ship2.left = true;
        }
        if(e.keyCode === 39){
            ship2.right = true;
        }
        if(e.keyCode === 38){
            ship2.up = true;
        }
    }
    if (gameOver == true) {
        if (e.keyCode === 13) {

            if(currentState == 2){
                currentState = 0;
                score = 0;
                numAsteroids = 10;
                asteroids = [];
                gameStart();
                main();
            }
            else{
                gameStart();
                gameOver = false;
                currentState = 1;
                main();
                scoreTimer();
            }
            
        }
    }
}

// //keypress for server//!
// //event listeners for controls
// document.addEventListener('keydown', keyPressDown)//keydown
// document.addEventListener('keyup', keyPressUp)//key up
// function keyPressDown(e) {//recieve event from event handler
//     if (e.keyCode === 68)//right//diagonal movement from else ifs
//         socket.emit('keypress', { inputId: 'right', state: true })
//     else if (e.keyCode === 65)//left
//         socket.emit('keypress', { inputId: 'left', state: true })
//     else if (e.keyCode === 87)//up
//         socket.emit('keypress', { inputId: 'up', state: true })
//     else if (e.keyCode === 83)//down
//         socket.emit('keypress', { inputId: 'down', state: true })
// }
// function keyPressUp(e) {//recieve event from event handler
//     if (e.keyCode === 68)//right//diagonal movement from else ifs
//         socket.emit('keypress', { inputId: 'right', state: false })
//     else if (e.keyCode === 65)//left
//         socket.emit('keypress', { inputId: 'left', state: false })
//     else if (e.keyCode === 87)//up
//         socket.emit('keypress', { inputId: 'up', state: false })
//     else if (e.keyCode === 83)//down
//         socket.emit('keypress', { inputId: 'down', state: false })
// }
// socket.on('newPositions', function (data) {
//     //data = new package we are sending
//     //loop through objects within data
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     for (var i = 0; i < data.player.length; i++) {
//         if(clientId == data.player[i].id){
//             px = data.player[i].x;
//             py = data.player[i].y;
//         }
//         ctx.fillText(data.player[i].number, data.player[i].x, data.player[i].y);
//     }
//     for (var i = 0; i < data.bullet.length; i++) {
//         ctx.fillRect(data.bullet[i].x + 5, data.bullet[i].y - 10,10,10);
//     }
// })


//GameStates state machine. This is what sets up menu screens and main game scene

//---Main Menu---
gameStates[0] = function(){
    highScoreElements.style.display = "none";
    ctx.drawImage(bgMain,0,0,c.width,c.height);
    ctx.save();
    ctx.font = "30px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center"
    ctx.fillText("Asteroid Avoidance: 2 Player Edition", c.width/2, c.height/2 - 30);
    ctx.font = "15px Arial";
    ctx.fillText("Press Enter to Start", c.width/2, c.height/2 + 20);
    ctx.restore();
}

//---Game Scene---
gameStates[1] = function(){
    //Draws score to the HUD
    ctx.save();
    ctx.font = "15px Arial";
    ctx.fillStyle = 'white';
    ctx.fillText("Score: " + score.toString(), c.width - 150, 30);
    ctx.restore();
    

    //ship.vy += gravity;

    //Key presses move the ship
    //p1
    if(ship.dead == false){
        if(ship.up == true){
        ship.vy = -10;
        }
        else{
            ship.vy = 3;
        }

        if(ship.left == true){
            ship.vx = -3;
        }
        else if(ship.right == true){
            ship.vx = 3;
        }
        else{
            ship.vx = 0;
        }
    }
    
    //p2
    if(ship2.dead == false){
        if(ship2.up == true){
            ship2.vy = -10;
        }
        else{
            ship2.vy = 3;
        }
    
        if(ship2.left == true){
            ship2.vx = -3;
        }
        else if(ship2.right == true){
            ship2.vx = 3;
        }
        else{
            ship2.vx = 0;
        }
    }

    // loops through asteroid instances in array and draws them to the screen
    for(var i = 0; i<asteroids.length; i++){
        //p1
        var dX = ship.x - asteroids[i].x;
        var dY = ship.y - asteroids[i].y;
        var dist = Math.sqrt((dX*dX)+(dY*dY));
        //p2
        var dX2 = ship2.x - asteroids[i].x;
        var dY2 = ship2.y - asteroids[i].y;
        var dist2 = Math.sqrt((dX2*dX2)+(dY2*dY2));

        //checks for collision between asteroid and ship
        if(detectCollision(dist, (ship.h/2 + asteroids[i].radius))){
           ship.dead = true;
        }

        if(detectCollision(dist2, (ship2.h/2 + asteroids[i].radius))){
            ship2.dead = true;
        }

        if (ship.dead == true && ship2.dead == true){
            // console.log("Colliding with asteroid " + i);
             
            currentState = 2;
            gameOver = true;
            //document.removeEventListener("keydown", keyPressDown);
            //document.removeEventListener("keyup", keyPressUp);
        }

        //recycles asteroids
        if(asteroids[i].y > c.height + asteroids[i].radius){
            asteroids[i].y = randomRange(c.height -asteroids[i].radius,asteroids[i].radius)-c.height;
            asteroids[i].x = randomRange(c.width + asteroids[i].radius,asteroids[i].radius);
        }

        if(gameOver == false){
            asteroids[i].y += asteroids[i].vy;
        }

        asteroids[i].draw();
    }
    
    //drawing is a queue
    if(ship2.dead == false)ship2.draw();
    if(ship.dead == false)ship.draw();
    
    if(gameOver == false){
        if(ship2.dead == false)ship2.move();
        if(ship.dead == false)ship.move();
    }

    while(asteroids.length < numAsteroids){
        asteroids.push(new Asteroids());
    }
}

//---Game Over Screen---//put new code for high score transfer here
gameStates[2] = function(){
    highScoreElements.style.display = "block";
    //console.log(score + " vs " + highScore);
    if(score > highScore){
        setScore(score);//pass score and name to app.js
        //console.log("High Score:" + score);
        highScore = score;
        ctx.save();
        ctx.font = "30px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center"
        ctx.fillText("Game Over, Your score was: " + score.toString(), c.width/2, c.height/2 - 60);
        ctx.fillText("Your New High Score is: " + highScore.toString() , c.width/2, c.height/2 - 30);
        ctx.fillText("New Record!!", c.width/2, c.height/2 );
        ctx.font = "15px Arial";
        ctx.fillText("Press Enter to Start", c.width/2, c.height/2 + 20);
        ctx.fillText("Enter a Name to Save Your Score!", c.width/2, c.height/2 + 125);
        ctx.restore();
    }
    else{
        //setScore(score);//dont take lower scores to "sort" entries
        ctx.save();
        ctx.font = "30px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center"
        ctx.fillText("Game Over, Your score was: " + score.toString(), c.width/2, c.height/2 - 60);
        ctx.fillText("Your high Score is: " + highScore.toString(), c.width/2, c.height/2 - 30);
        ctx.font = "15px Arial";
        ctx.fillText("Press Enter to Start", c.width/2, c.height/2 + 20);
        ctx.restore();
    }

    
}

//---Main Game Loop---
function main() {
    ctx.clearRect(0, 0, c.width, c.height);
   
    if (gameOver == false) {
        timer = requestAnimationFrame(main);
    }
    gameStates[currentState]();
}


//---Collision Detection Function---
function detectCollision(distance, calcDistance){
    return distance < calcDistance;
}


//--Score Timer Function---
function scoreTimer(){
    if(gameOver == false){
        score++;
        //using modulus divide the score by 5 and inf the remainder is zero addastteroids
        if(score % 5 == 0){
            numAsteroids += 5;
            //console.log(numAsteroids);
        }
       // console.log(score);
        setTimeout(scoreTimer, 1000);
    }
}


