import express from "express";
import {
    validationDataMiddleware,
    validationMiddleware,
    validationParamsMiddleware
} from "../utils/validation.middleware";
import {
    GetChatRoomResDto,
    GetChatResDto,
    PostChatDto
} from "../dtos/ChatDto";
import {
    UserIdParamsDto,
    RoomIdParamsDto
} from "../dtos/ElseDto"
import Room from "../models/Room";
import Chat from "../models/Chat"
import User from "../models/User"
const moment =require("moment");
import {verify,pager} from "../utils/middleware";
import HttpException from "../utils/HttpException";
import SuccessDto from "../dtos/SuccessDto";

class ChatController {

    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    public initializeRoutes() {
        this.router.get('/chat/user/:userId/room',validationParamsMiddleware(UserIdParamsDto),
            verify,pager,this.getChatRoom);

        this.router.get('/chat/user/:userId/room/:roomId',validationParamsMiddleware(UserIdParamsDto),
            validationParamsMiddleware(RoomIdParamsDto),verify,pager,this.getChat);

        this.router.get('/chat/message',validationMiddleware(PostChatDto),verify,this.createMessage);
    }


    getChatRoom=async(req:express.Request,res:express.Response,next:express.NextFunction)=>{

        const userId=req.params.userId;

        if(userId!=res.locals.id){
            return next(new HttpException(499,"접근권한이 없습니다"));

        }

        const page=res.locals.page;

        try{

            const roomIds=await Room.find({
                member:{
                    $elemMatch:{$eq:userId}
                }
            }).skip(page*8).limit(8).select('_id');


            const result:GetChatRoomResDto[]=[];

            for(let _ of roomIds){

                const [chat]=await Chat.find({roomId:_._id})
                    .sort({"createdAt":-1}).limit(1);


                const user=await User.findOne({_id:chat.userId})
                    .select('profileImgSrc adj job displayName');

                const ob:GetChatRoomResDto=new GetChatRoomResDto(user.profileImgSrc,user.adj,user.job,user.displayName,
                    chat.message,chat.userId,moment(chat.createdAt).format('YY/MM/DD HH:mm'));
                result.push(ob);
            }

            return res.json(new SuccessDto<GetChatRoomResDto[]>("채팅방 조회 성공",result));
        }
        catch(err){
            console.log(err);
            next(err);
        }
    }


    getChat=async(req:express.Request,res:express.Response,next:express.NextFunction)=>{

        const page=res.locals.page;
        let roomId=req.params.roomId;

        try{

            const exRoom=await Room.findOne({_id:roomId}).select('id');
            if(!exRoom){
                return next(new HttpException(454,"없는 방아이디입니다"));
            }

            let chat=await Chat.find({roomId:roomId}).sort({"createdAt":-1}).skip(page*8).limit(8);
            const result:GetChatResDto[]=[];

            for(let _ of chat){
                const ob:GetChatResDto=new GetChatResDto(_.message,_.userId,moment(_.createdAt).format('YY/MM/DD HH:mm'))
                result.push(ob);
            }

            return res.json(new SuccessDto<GetChatResDto[]>("채팅 조회 성공",result));

        }
        catch(err){
            console.log(err);
            next(err);
        }
    }


    createMessage=async(req:express.Request,res:express.Response,next:express.NextFunction)=>{

        let userId=res.locals.id;
        const message=req.body.message;
        const receiverId=req.body.receiverId;


        try{

            const self=await User.findOne({_id:userId}).select('_id displayName profileImgSrc');

            const user=await User.findOne({_id:receiverId}).select('_id');

            if(!user){
                return next(new HttpException(454,"없는 유저아이디입니다"));
            }

            const exRoom=await Room.findOne({
                $and:[
                    {member:{$elemMatch:{$eq:userId}}},
                    {member:{$elemMatch:{$eq:receiverId}}},
                ]
            });


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


                const chatMessage={
                    message:message,
                    userId:userId,
                    createdAt:moment(new Date()).format('YY/MM/DD HH:mm')
                }

                io.of('/chat').emit('chat', chatMessage);

                if(rooms&&rooms[receiverId]){
                    io.of('/room').to(receiverId).emit('create',{
                        userId:self._id,
                        profileImgSrc:self.profileImgSrc,
                        displayName:self.displayName,
                        message:message,
                        createdAt:moment(chat.createdAt).format('YY/MM/DD HH:mm')
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

                const chatMessage={
                    message:message,
                    userId:userId,
                    createdAt:moment(new Date()).format('YY/MM/DD HH:mm')
                }

                io.of('/chat').emit('chat', chatMessage);

                if(rooms&&rooms[receiverId]){
                    io.of('/room').to(receiverId).emit('update',{
                        userId:self._id,
                        profileImgSrc:self.profileImgSrc,
                        displayName:self.displayName,
                        message:message,
                        createdAt:moment(chat.createdAt).format('YY/MM/DD HH:mm')
                    })
                }

            }
            return res.json(new SuccessDto("메시지 전송 성공"));
        }
        catch(err){
            console.log(err);
            next(err);
        }
    }

}

export default ChatController;


/*let Chat = require('../models/Chat');
let Room = require('../models/Room');
let mongoose = require('mongoose');
const moment=require('moment');

exports.getChatRoom=async(req,res,next)=>{

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
            ob.createdAt=moment(chat.createdAt).format('YY/MM/DD HH:mm');
            
            result.push(ob);
        }

        return res.json({
            code:200,
            success:true,
            message:'채팅방조회 성공',
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
            data:{
                chat:result
            }
        });

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


            const chatMessage={
                message:message,
                userId:userId,
                createdAt:moment(new Date()).format('YY/MM/DD HH:mm')
            }

            io.of('/chat').emit('chat', chatMessage);

            if(rooms&&rooms[receiverId]){
                io.of('/room').to(receiverId).emit('create',{
                    userId:self._id,
                    profileImgSrc:self.profileImgSrc,
                    displayName:self.displayName,
                    message:message,
                    createdAt:moment(chat.createdAt).format('YY/MM/DD HH:mm')
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

            const chatMessage={
                message:message,
                userId:userId,
                createdAt:moment(new Date()).format('YY/MM/DD HH:mm')
            }

            io.of('/chat').emit('chat', chatMessage);

            if(rooms&&rooms[receiverId]){
                io.of('/room').to(receiverId).emit('update',{
                    userId:self._id,
                    profileImgSrc:self.profileImgSrc,
                    displayName:self.displayName,
                    message:message,
                    createdAt:moment(chat.createdAt).format('YY/MM/DD HH:mm')
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
}*/