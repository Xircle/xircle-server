const {encrypt,decrypt}=require('../utils/function');
let User = require('../models/User');
let Room = require('../models/Room');
let Chat = require('../models/Chat');
const jwt = require('jsonwebtoken');
let mongoose = require('mongoose');
const moment=require('moment');

exports.getChatRoom=async (req,res,next)=>{
    try{
        res.render('socket.ejs');

    }
    catch(err){
        console.log(err);
        next(err);
    }

}



exports.register=async (req,res,next)=>{
    try{
        
        
        const user=await User.findOne({
            displayName:"testman2"
        });

      
      
        const token = await jwt.sign(
        {
            id: user._id
        }, 
        process.env.JWT_SECRET, 
        {
            expiresIn: '365d'
        });

        

        return res.json({
            code:200,
            message:'유저 등록 성공',
            success:true,
            data:{
                token:token,
                userId:user._id
            }
        })

    }
    catch(err){
        console.log(err);
        next(err);
    }

}



exports.createMessage=async(req,res,next)=>{

    let userId=req.id;
    const message=req.body.message;
    let receiverId=req.body.receiverId;

 

    if(receiverId){
        receiverId=mongoose.mongo.ObjectId(receiverId);
    }
    else{
        return res.json({
            success:false,
            code:500,
            message:"수신자 아이디 입력해주세요"
        })
    }

    if(!message){
        return res.json({
            success:false,
            code:500,
            message:"메시지를 입력해주세요"
        })
    }

    if(typeof(message)!='string'){
        return res.json({
            success:false,
            code:500,
            message:"메시지는 문자열입니다"
        })
    }

    try{

     
        
        const self=await User.findOne({_id:userId}).select('_id displayName profileImgSrc');

        
        const user=await User.findOne({_id:receiverId}).select('_id');

        if(!user){
            return res.json({
                code:454,
                success: false,
                message: '없는 유저아이디입니다'
            });
        }

        const exRoom=await Room.findOne({
            member:{
                $elemMatch:{$eq:userId}
            },
            member:{
                $elemMatch:{$eq:receiverId}
            }
        })

        if(!exRoom){
            const room=await Room.create({
                member:[userId,receiverId],
                type:"personal"
            });

            const chat=await Chat.create({
                message:message,
                roomId:room._id,
                userId:userId
            });

            const io=req.app.get('io');
            const {rooms}=io.of('/room').adapter;

            if(rooms&&rooms[receiverId]){
                io.of('/room').emit('create',{
                    userId:self._id,
                    profileImgSrc:self.profileImgSrc,
                    displayName:self.displayName,
                    message:message,
                    createdAt:moment(chat.createdAt).add(9,'h').format('YY/MM/DD HH:mm')
                })
            }
        }
        else{

            const chat=await Chat.create({
                message:message,
                roomId:exRoom._id,
                userId:userId
            });

            
            const io=req.app.get('io');
            const {rooms}=io.of('/room').adapter;

            if(rooms&&rooms[receiverId]){
                io.of('/room').emit('update',{
                    userId:self._id,
                    profileImgSrc:self.profileImgSrc,
                    displayName:self.displayName,
                    message:message,
                    createdAt:moment(chat.createdAt).add(9,'h').format('YY/MM/DD HH:mm')
                })
            }

        }

        return res.json({
            success:true,
            code:200,
            message:"메시진 전송 성공"
        })
    }
    catch(err){
        console.log(err);
        next(err);
    }
}




exports.getRoom=async(req,res,next)=>{

    const userId=mongoose.mongo.ObjectId(req.params.userId);

    
    if(String(userId)!=String(req.id)){
        return res.json({
            code:200,
            success:true,
            message:'접근 권한이 없습니다.'
        });
    }

    const page=req.page;

    try{

        const roomIds=await Room.find({
            member:{
                $elemMatch:{$eq:userId}
            }
        }).skip(page*8).limit(8).select('_id');


        let result=[];

        for(let _ of roomIds){
            
            let ob={};

            const [chat]=await Chat.find({roomId:_._id})
            .sort({"createdAt":-1}).limit(1);

            
            const user=await User.findOne({_id:chat.userId})
            .select('profileImgSrc adj job displayName');

            ob.profileImgSrc=user.profileImgSrc;
            ob.adj=user.adj;
            ob.job=user.job;
            ob.displayName=user.displayName;
            ob.message=chat.message;
            ob.userId=chat.userId;
            ob.createdAt=moment(chat.createdAt).add(9,'h').format('YY/MM/DD HH:mm');
            
            result.push(ob);
        }

        return res.json({
            code:200,
            success:true,
            message:'채팅방 조회 성공',
            data:{
                chatRoom:result
            }
        });

    }
    catch(err){
        console.log(err);
        next(err);
    }
}


exports.getChat=async(req,res,next)=>{

    const page=req.page;
    let roomId=req.params.roomId;
    roomId=mongoose.mongo.ObjectId(roomId);

    if(!roomId){
        return res.json({
            code:499,
            success:false,
            message:'없는 방아이디입니다.',
        });
    }
    

    try{

        const exRoom=await Room.findOne({_id:roomId}).select('id');
        if(!exRoom){
            return res.json({
                code:499,
                success:false,
                message:'없는 방아이디입니다.',
            });
        }

        let chat=await Chat.find({roomId:roomId}).sort({"createdAt":-1}).skip(page*8).limit(8);
        let result=[];

        for(let _ of chat){
            let ob={}
            ob.message=_.message;
            ob.userId=_.userId;
            ob.createdAt=moment(_.createdAt).format('YY/MM/DD HH:mm');
            result.push(ob);
        }

        return res.json({
            code:200,
            success:true,
            message:'채팅조회성공',
            chat:result
        });

    }
    catch(err){
        console.log(err);
        next(err);
    }
}


exports.test=async(req,res,next)=>{

    try{

        console.log(moment(new Date()).format('YY/MM/DD HH:mm'));

        return res.json({success:true});

      

    }
    catch(err){
        console.log(err);
        next(err);
    }
}