var express = require('express');
var mongoose = require('mongoose');
var app = express();
var path = require('path');
var bodyparser = require('body-parser');//component of express to parse jsons
//const { Console } = require('console');
const { EPERM } = require('constants');
const { request } = require('http');

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

//!edit to obtain data after game ends and is new high score//uncommenting one makes the other not work
//name
//var Record = mongoose.model('Record', {name:String});//model = schema
//var record = new Record({name:"New Record Holder"});
//record.save().then(function(){//save the entry
//    Console.log("Record Saved");
//})
//score
// var Record = mongoose.model('Record', {score:Number});//model = schema
// var record = new Record({score:5});
// record.save().then(function(){//save the entry
//     console.log("Record Saved");
// })

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