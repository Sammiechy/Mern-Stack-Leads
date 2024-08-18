const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const leadSchema= new mongoose.Schema({
    userId:{type:String,required:true,unique:true},
    name:{type:String, required:true,unique:true},
    email:{ type:String, required:true, unique:true},
    number:{ type:Number,required:true},
    product:{type:String,required:true}
})

module.exports= mongoose.model("Leads",leadSchema);