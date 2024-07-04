const asynchandler = require('express-async-handler');
const Chat = require('../models/chatModel');
const User = require('../models/userModel');
const accessChat = asynchandler( async (req,res)=>{

    const { userId } = req.body;
    if(!userId){
        console.log("No User Params Id send");
      res.status(400);
        return ;
    } 
    var isChat  = await Chat.find({
        isGroupedChat : false,
       $and : [
        {users : { $elemMatch : {$eq : req.user._id} }},
        {users : {$elemMatch : {$eq : req.userId}}},
    
       ]
    }).populate('users',"-password").populate("latestMessage");
    isChat = await User.populate(isChat,{
        path : "latestMessage.sender",
        select : "name pic email",
    });
    if(isChat.length>0){
        res.send(isChat[0]);
    }
    else{
        try{
            var chatData = {
                chatName : "sender",
                isGroupedChat : false,
                users : [req.user._id,userId],
            };
            const createdChat = await Chat.create(chatData);

            const FullChat = await Chat.findOne({_id:createdChat._id}).populate("users","-password");
            res.status(200).json(FullChat);
        }catch(error){
           res.status(400);
           throw new Error(error.message);
        }
    }

})


//fetch Chat
const fetchChat = asynchandler( async (req,res)=>{
    try{
    Chat.find({users : {$elemMatch : {$eq : req.user._id}}})
    .populate("users","-password")
    .populate("groupAdmin","-password")
    .populate("latestMessage")
    .sort({updatedAt : -1})
    .then( async(results)=>{
        results = await User.populate(results,{
            path : "latestMessage.sender",
            select : "name pic email",
        })
        res.status(200).json(results);
    })
     
}
    catch(error){

    }
})
//create Group Chat
const createGroupChat = asynchandler( async (req,res)=>{
        if(!req.body.users||!req.body.name){
            return res.status(400).send({message : "Please Fill all the feilds"});
        }
        var users = JSON.parse(req.body.users);
        if(users.length<2){
            return res.status(400).send("More than 2 users are required to make a group");
        }
        users.push(req.user);
       
        try{
                    const groupChat = await Chat.create({
                        chatName : req.body.name,
                        users : users,
                        isGroupChat : true,
                        groupAdmin : req.user,
                    });
                   const fullGroupChat = await Chat.findOne({_id: groupChat._id})
                   .populate('users',"-password")
                   .populate("groupAdmin","-password");
                   res.status(200).json(fullGroupChat);
             }catch(error){
               res.status(400);
               throw new Error(error.message);
        }

})

// Rename Group
const renameGroup = asynchandler( async (req,res)=>{
    const {chatId,chatName} = req.body;
    const updatedChat = await Chat.findByIdAndUpdate(chatId,{chatName},{new:true})
    .populate("users","-password")
    .populate("groupAdmin","-password");
        if(!updatedChat){
            res.status(404);
            throw new Error('Chat Not Found');
        }
        else{
            res.json(updatedChat);
        }
})

//Add to Group
const addToGroup = asynchandler( async (req,res)=>{

    const {chatId ,userId} = req.body;
    const added = await Chat.findByIdAndUpdate(chatId,{
        $push : {users : userId},
    },{new : true})
    .populate('users',"-password")
    .populate('groupAdmin', "-password");

    if(!added){
        res.status(404);
        throw new Error("Chat Not Found");
    }
    else{
        res.json(added);
    }
})
const removeFromGroup = asynchandler( async (req,res)=>{
    const {chatId,userId} = req.body;
    const remove = await Chat.findByIdAndUpdate(chatId,{
        $pull : {users : userId},
    },{new : true})
    .populate("users","-password")
    .populate("groupAdmin","-password");
    if(!remove){
        res.status(404)
        throw new Error("Not Found Chat");
    }
    else{
        res.json(remove);
    }
})
module.exports = {accessChat,fetchChat,createGroupChat,renameGroup,addToGroup,removeFromGroup};


