
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

mongoose.connect(process.env.MONGO_URL)
.then(()=>console.log("MongoDB connected"))
.catch(err=>console.error(err));

const User = mongoose.model('User', new mongoose.Schema({
  username:{type:String,unique:true,required:true},
  password:{type:String,required:true}
}));

app.post('/api/register', async (req,res)=>{
 try{
   const {username,password} = req.body;
   if(!username || !password) return res.status(400).json({message:'All fields required'});
   const exists = await User.findOne({username});
   if(exists) return res.status(409).json({message:'Username already exists'});
   const hash = await bcrypt.hash(password,10);
   await User.create({username,password:hash});
   res.json({message:'Registration successful'});
 }catch(e){res.status(500).json({message:'Server error'});}
});

app.post('/api/login', async (req,res)=>{
 try{
   const {username,password}=req.body;
   const user=await User.findOne({username});
   if(!user) return res.status(400).json({message:'Invalid credentials'});
   const ok=await bcrypt.compare(password,user.password);
   if(!ok) return res.status(400).json({message:'Invalid credentials'});
   const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'});
   res.json({token});
 }catch(e){res.status(500).json({message:'Server error'});}
});

app.get('/api/me',(req,res)=>{
 const auth=req.headers.authorization||'';
 const token=auth.replace('Bearer ','').trim();
 try{
   const data=jwt.verify(token,process.env.JWT_SECRET);
   res.json({user:data.id});
 }catch{
   res.status(401).json({message:'Unauthorized'});
 }
});

app.listen(process.env.PORT || 3000);
