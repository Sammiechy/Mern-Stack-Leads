const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken'); 
const axios = require('axios');
const User = require('./models/User'); 
const Lead = require('./models/Leads');
require('dotenv').config();

const myApp = express();
myApp.use(cors({
    origin: 'http://localhost:3001', // Replace with your React app's origin
    methods: ['GET', 'POST', 'DELETE', 'PUT'], // Specify the methods you want to allow
    allowedHeaders: ['Content-Type', 'Authorization'], // Specify the headers you want to allow
    credentials: true, 
}));
myApp.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true , serverSelectionTimeoutMS: 30000});
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to DB');
});
mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});
mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});

myApp.post('/api/signup', async (req, res) => {
    console.log('Signup route hit');
    const { username, email, password, captchaToken } = req.body;
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`;

    try {
        const response = await axios.post(verifyUrl);
        if (!response.data.success) {
            return res.status(400).json({ message: 'Captcha verification failed' });
        }
        const userDetail = new User({ username, email, password });
        await userDetail.save();

        const token = jwt.sign({ id: userDetail._id }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.status(200).json({
            message: "Successfully saved",
            token: token
        });
    } catch (err) {
        console.error(err,"serrrrrrrrrrrrrrrr");  // Log the error for debugging
        res.status(500).json({ message: 'Server Error' });
    }
});

myApp.post('/api/login',async(req,res)=>{
    const {email, password }= req.body;
    try{
     const user= await User.findOne({email});
    
     if(!user){
        return res.status(400).json({messgae:"User not found"})
     }
    
    //  const isMatch= await bcrypt.compare(password,user.password)
    //  console.log(user,isMatch,"99999999999999999999999")
    //  if(!isMatch){
    //     return res.status(400).json({messgae:"credentials invalid"});
    //  }
     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
     
    res.status(200).json({
        message:"Login successfully !",
        token:token,
        user:{
            id: user._id,
            username:user.username,
            email:user.email
        }
    })

    }catch(err){
     res.json({messgae:"Something went wrong"});
    }
})

myApp.post('/api/leads',async(req,res)=>{
    const {name,email,number, product,userId}= req.body;
    try{
        const lead= new Lead ({name,email,number,product,userId});
        await lead.save();

        res.status(200).json({message:"Leads successfully created !"})
    } catch (err){
        console.log(err);
        res.status(500).json({messgae:"Something went wrong",error:err.message})
    }
})

myApp.get('/api/leads',async(req,res)=>{
    const { userId, email } = req.query; 
    try{
        let query = {};
        if (userId) {
            query.userId = userId;
        }
        console.log(query,"query")
     const leads= await Lead.find(query)
     res.status(200).json({messgae:"all leads",leads:leads})
    }catch(err){
     res.status(500).json({messgae:"something went wrong", err:err.message});
    }
})

myApp.delete('/api/leads/:id',async(req,res)=>{
    const {id}=req.params;
    console.log(id,"id-------")
    try{
    const lead = await Lead.findByIdAndDelete(id);
    if(!lead){
        return res.status(404).json({messgae:'Lead not found'})
    }else{
        return res.status(200).json({message:'Lead is deleted successfully'});
    }
    }catch(err){
        console.log(err,"error----");
        res.status(500).json({message:" Server Error",error:err.message})
    }
})

myApp.put('/api/leads/:id',async(req,res)=>{
    const {id}= req.params;
    const{name,email,number,product}= req.body
    try{
       const lead = await Lead.findByIdAndUpdate(id,{name,email,number,product},{new:true,runValidators:true});
       if (!lead) {
        return res.status(404).json({ message: 'Lead not found' });
    }else{
        res.status(200).json({ message: 'Lead updated successfully', lead });
    }
    }catch(err){
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
})

myApp.listen(process.env.PORT || 3000, () => {
    console.log('Server is running on port 3000');
});
