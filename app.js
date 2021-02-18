var express = require('express');
var mongoose = require('mongoose');
var app = express();
var path = require('path');
var bodyparser = require('body-parser');//component of express to parse jsons
//const { Console } = require('console');
const { EPERM } = require('constants');
const { request } = require('http');

var serv = require('http').Server(app);//refer to server when refering to certain connections
var io = require('socket.io')(serv,{});

//sets up middleware to use in application
app.use(bodyparser.json());//key value pairs in json obj
app.use(bodyparser.urlencoded({extended:true}));//all reading of encoded urls
app.use(express.json());

//makes the connection to the database server
mongoose.connect('mongodb://localhost:27017/recordEntries', {//connect to mongoose //connect('connection string', {exeptions})
    useNewUrlParser:true
}).then(function(){
    console.log("Connected to MongoDB Database");
}).catch(function(err){
    console.log(err);
});

//load in database templates
require('./models/Record');//require folder
var Record = mongoose.model('record');

//example of a POST route
app.post('/saveRecord', function(req,res){
    console.log("Request Made");
    console.log(req.body);
    new Record(req.body).save().then(function(){
        if(highScoreServer<req.body.score){
            highScoreServer = req.body.score;
            console.log("New High score according to server:" + highScoreServer);
        }
        res.redirect('recordlist.html');
    })
})

//gets the data for the list
app.get('/getData',function(req,res){//utilize mongoose commands to grab data //{} = all data //.then = promise
    Record.find({}).then(function(record){
        res.json({record})
    })
})

//postroute to delete record entry
app.post('/deleteRecord', function(req,res){
    console.log('Record Deleted', req.body._id);
    Record.findByIdAndDelete(req.body._id).exec();
    res.redirect('recordlist.html');
})


app.use(express.static(__dirname+"/views"))
app.listen(5000, function(){//connect to database
    console.log("Listening on port 5000");
});

var SocketList = {};

//Class for GameObject
var GameObject = function(){
    var self = {
        x:400,
        y:300,
        spX:0,
        spY:0,
        id:""
    };
    
    self.update = function(){
        self.updatePosition()
    }

    self.updatePosition = function(){
        self.x += self.spX;
        self.y += self.spY;
    }
    self.getDist = function(point){
        return Math.sqrt(Math.pow(self.x - point.x, 2) + Math.pow(self.y - point.y, 2));//distance formula
    }
    return self;
}

//add to game object class with new class
var Player = function(id){//class, similar to constructor
    var self = GameObject()
    self.id = id;
    self.number = Math.floor(Math.random()*10);
    self.right = false;
    self.left = false;
    self.up = false;
    self.down = false;
    self.attack = false;
    self.mouseAngle = 0;
    self.speed = 10;
    
    var playerUpdate = self.update;//inherited from base class

    self.update = function(){
        self.updateSpeed();
        playerUpdate();
    }

    self.updateSpeed = function(){
        if(self.right){
            self.spX = self.speed;
        }else if(self.left){
            self.spX = -self.speed
        }else{//prevent acceleration endlessly
            self.spX = 0;
        }

        if(self.up){
            self.spY = -self.speed;
        }else if(self.down){
            self.spY = self.speed;
        }else{//prevent acceleration endlessly
            self.spY = 0;
        }
    }

    Player.list[id] = self;

    return self;
}

Player.list = {}//= empty json

//list of functions for player connection and movement
Player.onConnect = function(socket){
    var player = new Player(socket.id);//instance of player, utlize new x,y
    
    //recieves player input
    socket.on('keypress', function(data){
        //console.log(data.state)
        if(data.inputId === 'up')
            player.up = data.state;
        if(data.inputId === 'down')
            player.down = data.state;
        if(data.inputId === 'left')
            player.left = data.state;
        if(data.inputId === 'right')
            player.right = data.state;
        if(data.inputId === 'attack')
            player.attack = data.state;
        if(data.inputId === 'mouseAngle')
            player.mouseAngle = data.state;
    });
}

Player.onDisconnect = function(socket){
    delete Player.list[socket.id];
}

Player.update = function(){
    var pack = [];//collection of each package
    for (var i in Player.list){
        var player = Player.list[i];
        player.update();
        //console.log(player)
        pack.push({
            x: player.x,
            y: player.y,
            number: player.number,
            id:player.id
        })
    }

    return pack;
}

//!__
//Connection to game
io.sockets.on('connection', function(socket){//when connected to socket.io, is opened when someone on client connects to server
    console.log("Socket Connected");

    socket.id = Math.random();//random id, unlikely to be the same
    //socket.x = 0;
    //socket.y = Math.floor(Math.random()*600)//random number * canvas height
    //socket.number = Math.floor(Math.random()*10)//random number * canvas height
    //add something to socket list
    SocketList[socket.id] = socket;
    
    //disconnection event
    socket.on('disconnect', function(){//disconnection
        delete SocketList[socket.id];
        Player.onDisconnect(socket);
    });

    socket.on('evalServer', function(data){
        if(!debug){
            return
        }
        var res = eval(data);//evaluate()
        socket.emit('evalResponse', res)
    });
});

//setup update loop
setInterval(function(){
    var pack = {
        player:Player.update(),
    };
    for (var i in SocketList){
        var socket = SocketList[i];//new local refernce to update previous versions
        socket.emit('newPositions', pack);
    };
}, 1000/30);//code to be executed when run, time in ms