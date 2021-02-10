const { Int32 } = require('bson');
var mongoose = require('mongoose');//redundancy for fallback if separated from program
var Schema = mongoose.Schema;

var DataSchema = new Schema({
    name:{
        type:String,
        required:true//required to create entry, validator
    },
    score:{
        type:Number,//number is javascript for integers and floats
        required:true//required to create entry, validator
    }//,
});

mongoose.model('record', DataSchema)//export model
//can now reference varible to create a new entry