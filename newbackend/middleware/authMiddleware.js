const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const asynchandler = require('express-async-handler');
module.exports.authorizeUser = asynchandler(async(req,res,next)=>{
    let token;
    if(req.headers.authorization&&req.headers.authorization.startsWith("Bearer")){
        try{
       token = req.headers.authorization.split(" ")[1];

       const decode = jwt.verify(token,process.env.JWT_SECRET);
       req.user = await User.findById(decode.id).select("-password");
       next();
        }catch(error){
        res.status(401);
        throw new Error("Not authorized ,token Failed");
        }
    }
    else{
        res.status(401);
        throw new Error("Tokken Incorrect");
    }
})
