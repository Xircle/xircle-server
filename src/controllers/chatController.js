let Chat = require('../models/Chat');
let Room = require('../models/Room');
let mongoose = require('mongoose');
const moment=require('moment');

exports.getChat=async(req,res,next)=>{
    try{

        return res.json({
            code:200,
            success:true,
            message:'채팅 조회 성공'
        });

    }
    catch(err){
        next(err);
    }
}

exports.createRoom=async(req,res,next)=>{

    let userId=req.id;
    const message=req.body.message;
    let receiverId=req.body.receiverId;

    if(userId){
        userId=mongoose.mongo.ObjectId(userId);
    }

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

    if(type(message)!='string'){
        return res.json({
            success:false,
            code:500,
            message:"메시지는 문자열입니다"
        })
    }

    try{
        
        const self=await User.findOne({_id:userId});

        if(!self){
            return res.json({
                code:454,
                success: false,
                message: '없는 유저아이디입니다'
            });
        }
        
        const user=await User.findOne({_id:receiverId});

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
    }
    catch(err){
        next(err);
    }
}