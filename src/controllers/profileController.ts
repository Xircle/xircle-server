import express from "express";
import {
    validationDataMiddleware,
    validationMiddleware,
    validationParamsMiddleware,
    validationQueryMiddleware
} from "../utils/validation.middleware";
import {
    GetProfileResDataDto,
    GetProfileResDto,
    GetProfilePostData,
    GetProfilePostResDto,
    UpdateProfileData,
    UpdateProfileDto
} from "../dtos/ProfileDto";

import {
    UserIdParamsDto,
    InterestQueryDto
} from "../dtos/ElseDto"
import {verify,pager,upload,resize} from "../utils/middleware";
import HttpException from "../utils/HttpException";
import User from '../models/User';
import Post from '../models/Post';
import SuccessDto from "../dtos/SuccessDto";
import fs from 'fs';
import path from 'path';

class ProfileController {

    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    public initializeRoutes() {
        this.router.get( "/user/:userId/profile", validationParamsMiddleware(UserIdParamsDto),
            verify, this.getProfile);
        this.router.get("/user/:userId/profile/post",validationParamsMiddleware(UserIdParamsDto),
            validationQueryMiddleware(InterestQueryDto),pager,verify,this.getPost);
        this.router.put("/user/profile/post",validationMiddleware(UpdateProfileDto),
            validationDataMiddleware(UpdateProfileData),upload.single('profileImgSrc'),
            resize,verify,this.updateProfile);

    }


    getProfile=async (req:express.Request,res:express.Response,next:express.NextFunction)=>{

        const selfId=res.locals.id;
        const userId=req.params.userId;

        try{

            let user;

            if(userId==='0'){
                [user]=await User.aggregate([
                    {$match:{_id:{$ne:selfId}}},
                    {$sample:{size:1}},
                    {$project:{profileImgSrc:1,adj:1,job:1,displayName:1,gender:1,university:1,isGraduate:1,
                            isPublic:1,location:1,age:1,resume:1,workPlace:1,introText:1,mainHashtags:1,_id:1,isLocationPublic:1,position:1}}
                ]);
            }
            else{
                user=await User.findOne({_id:userId}).select(`
            profileImgSrc adj job displayName gender university isGraduate isPublic location 
            age resume workPlace introText mainHashtags isLocationPublic position _id`);

                if(!user){
                    return next(new HttpException(454,"없는 유저아이디입니다"));
                }
            }

            const interestArr:GetProfileResDataDto[]=[];

            for(let _ of user.mainHashtags){
                let [count]=await User.aggregate([
                    {$unwind:'$hashtags'},
                    {$match:{hashtags:_}},
                    {$group:{_id:'$_id'}},
                    {$count:"count"}
                ]);
                const ob:GetProfileResDataDto=new GetProfileResDataDto(_,count.count);
                interestArr.push(ob);
            }
            const result:GetProfileResDto=new GetProfileResDto(user.profileImgSrc,user.adj,user.job,
                user.displayName,user.gender,user.university,user.isGraduate,user.isPublic,user.location,
                user.age,user.resume,user.workPlace,user.introText,user.isLocationPublic,user._id,
                interestArr,user.position[1],user.position[0]);

            return res.json(new SuccessDto<GetProfileResDto>("프로필 조회 성공",result));

        }
        catch(err){
            console.log(err);
            next(err);
        }

    }



    getPost=async (req:express.Request,res:express.Response,next:express.NextFunction)=>{

        const interest=req.query.interest;
        const page=res.locals.page;
        const userId=req.params.userId;


        try{

            const user=await User.findOne({_id:userId}).select('_id');

            if(!user){
                return next(new HttpException(454,"없는 유저아이디입니다"));
            }

            const post=await Post.find({
                userId:userId,
                hashtags:{
                    $elemMatch:{$eq:interest}
                }
            }).skip(8*page).limit(8).select('title uploadedPhoto');

            let result:GetProfilePostData[]=[];


            for(let _ of post){
                let ob=new GetProfilePostData(_.title,_.uploadedPhoto[0]);
                result.push(ob);
            }

            return res.json(new SuccessDto<GetProfilePostResDto>("메일전송 성공입니다",
                new GetProfilePostResDto(userId,result)));
        }
        catch(err){
            console.log(err);
            next(err);
        }
    }




    updateProfile=async (req:express.Request,res:express.Response,next:express.NextFunction)=>{

        const userId=res.locals.id;

        const {
            job,
            adj,
            introText,
            location,
            latitude,
            longitude,
            isGraduate,
            isPublic
        } = req.body.data;

        let {resume,workPlace,isLocationPublic}=req.body.data;

        if(!resume) resume="";
        if(!workPlace) workPlace="";

        let position=[];
        if(longitude) position.push(longitude);
        if(latitude) position.push(latitude);

        if(isLocationPublic===null||isLocationPublic===undefined) isLocationPublic=true;

        try{

            const user=await User.findOne({_id:userId}).select('profileImgSrc');

            let profileImgSrc;
            if(req.file){
                profileImgSrc=process.env.URL+req.file.filename;
                fs.unlinkSync(path.join(__dirname,`../../uploads/${user.profileImgSrc.split('/').pop()}`));
            }
            else{
                profileImgSrc=user.profileImgSrc;
            }

            await User.updateOne({
                _id:userId
            },[
                {$set:{
                        profileImgSrc:profileImgSrc,
                        job:job,
                        adj:adj,
                        introText:introText,
                        location:location,
                        isPublic:isPublic,
                        isGraduate:isGraduate,
                        position:position,
                        isLocationPublic:isLocationPublic,
                        resume:resume,
                        workPlace:workPlace
                    }}
            ])

            return res.json(new SuccessDto("프로필 수정 성공"));
        }
        catch(err){
            console.log(err);
            next(err);
        }
    }



}
export default ProfileController;

/*let User = require('../models/User');
let Post = require('../models/Post');
let mongoose = require('mongoose');

const fs=require('fs');
const path=require('path');
const dotenv = require('dotenv');
dotenv.config();





exports.getProfile=async (req,res,next)=>{

    const selfId=req.id;

    let userId=req.params.userId;

    if(userId===undefined||userId===null){
        return res.json({
            code:429,
            success: false,
            message: '유저아이디 입력해주세요'
        });
    }

    try{




        let user;

        if(userId==='0'){
            [user]=await User.aggregate([
                {$match:{_id:{$ne:selfId}}},
                {$sample:{size:1}},
                {$project:{profileImgSrc:1,adj:1,job:1,displayName:1,gender:1,university:1,isGraduate:1,
                isPublic:1,location:1,age:1,resume:1,workPlace:1,introText:1,mainHashtags:1,_id:1,isLocationPublic:1,position:1}}
            ]);      
        }
        else{
            userId=mongoose.mongo.ObjectId(userId);

            user=await User.findOne({_id:userId}).select(`
            profileImgSrc adj job displayName gender university isGraduate isPublic location 
            age resume workPlace introText mainHashtags isLocationPublic position _id`);

            if(!user){
                return res.json({
                    success:false,
                    code:454,
                    message:'없는 유저아이디입니다'
                });
            }
        }

        let result={};
        
        result.profileImgSrc=user.profileImgSrc;
        result.adj=user.adj;
        result.job=user.job;
        result.displayName=user.displayName;
        result.gender=user.gender;
        result.university=user.university;
        result.isGraduate=user.isGraduate;
        result.isPublic=user.isPublic;
        result.location=user.location;
        result.age=user.age;
        result.resume=user.resume;
        result.workPlace=user.workPlace;
        result.introText=user.introText;
        result.isLocationPublic=user.isLocationPublic;
        result.userId=user._id;
       
        let interestArr=[];

        for(let _ of user.mainHashtags){
            let ob={};
            ob.interest=_;
            
            let [count]=await User.aggregate([
                {$unwind:'$hashtags'},
                {$match:{hashtags:_}},
                {$group:{_id:'$_id'}},
                {$count:"count"}
            ]);

            const activity=await Post.find({
                userId:user._id,
                hashtags:{
                    $elemMatch:{$eq:_}
                }
            }).count();

            ob.activity=activity;
           

            ob.count=count.count;

            interestArr.push(ob);
        }

        result.interestArr=interestArr;
        result.latitude=user.position[1];
        result.longitude=user.position[0];
       
        return res.json({
            code:200,
            message:'프로필 조회 성공',
            success:true,
            data:result
        })

    }
    catch(err){
        console.log(err);
        next(err);
    }

}




exports.getPost=async (req,res,next)=>{

    const interest=req.query.interest;
    const page=req.page;
    const userId=mongoose.mongo.ObjectId(req.params.userId);

    if(!interest){
        return res.json({
            code:444,
            message:'게시물 관심사를 입력해주세요',
            success:false
        })
    }
  

    if(!userId){
        return res.json({
            code:429,
            success: false,
            message: '유저아이디 입력해주세요'
        });
    }



    try{

        
  

        const user=await User.findOne({_id:userId}).select('_id');

        if(!user){
            return res.json({
                success:false,
                code:454,
                message:'없는 유저아이디입니다'
            });
        }
        


        const post=await Post.find({
            userId:userId,
            hashtags:{
                $elemMatch:{$eq:interest}
            }
        }).skip(8*page).limit(8).select('title uploadedPhoto');

        let result=[];

        if(post){
            for(let _ of post){
                let ob={};
                ob.articleTitle=_.title;
                ob.articleImgSrc=_.uploadedPhoto[0];
                result.push(ob);
            }
        }

        return res.json({
            code:200,
            message:'관심사에 해당하는 게시물 조회 성공',
            success:true,
            data:{
                userId:userId,
                post:result
            }
        })


    }
    catch(err){
        console.log(err);
        next(err);
    }
}





exports.updateProfile=async (req,res,next)=>{

    const userId=req.id;

    req.body.data=JSON.parse(req.body.data);

    const {
        job,
        adj,
        introText,
        location,
        latitude,
        longitude,
        isGraduate,
        isPublic
    } = req.body.data;

    let {resume,workPlace,isLocationPublic}=req.body.data;
    
    if(!resume) resume="";
    if(!workPlace) workPlace="";
 


    if(!job){
        return res.json({
            code:417,
            success:false,
            message:'직업을 입력해주세요'
        })
    }
    if(typeof(job)!='string'){
        return res.json({
            code:418,
            success:false,
            message:'직업은 문자열입니다'
        })
    }
    if(!adj){
        return res.json({
            code:419,
            success:false,
            message:'형용사를 입력해주세요'
        })
    }
    if(typeof(adj)!='string'){
        return res.json({
            code:420,
            success:false,
            message:'형용사는 문자열입니다'
        })
    }
    if(!introText){
        return res.json({
            code:421,
            success:false,
            message:'소개를 입력해주세요'
        })
    }
    if(typeof(introText)!='string'){
        return res.json({
            code:422,
            success:false,
            message:'소개는 문자열입니다'
        })
    }
  
    if(!location){
        return res.json({
            code:423,
            success:false,
            message:'주소를 입력해주세요'
        })
    }
    if(typeof(location)!='string'){
        return res.json({
            code:424,
            success:false,
            message:'주소는 문자열입니다'
        })
    }
   

  

    if(isPublic===undefined||isPublic===null){
        return res.json({
            code:432,
            success:false,
            message:'공개여부를 입력해주세요'
        })
    }

   

    if(isGraduate===undefined||isGraduate===null){
        return res.json({
            code:433,
            success:false,
            message:'졸업여부를 입력해주세요'
        })
    }

  
    
    if(typeof(isPublic)!=='boolean'){
        return res.json({
            code:434,
            success:false,
            message:'공개여부는 boolean형입니다'
        })
    }

    
    if(typeof(isGraduate)!=='boolean'){
        return res.json({
            code:435,
            success:false,
            message:'졸업여부는 boolean형입니다'
        })
    }



    let position=[];
    
    if(longitude) position.push(longitude);
    if(latitude) position.push(latitude);
   

    if(isLocationPublic===null||isLocationPublic===undefined) isLocationPublic=true;



    try{

        const user=await User.findOne({_id:userId}).select('profileImgSrc');
        
     
        let profileImgSrc;
        if(req.file){
            profileImgSrc=process.env.URL+req.file.filename;
            fs.unlinkSync(path.join(__dirname,`../../uploads/${user.profileImgSrc.split('/').pop()}`));
        }
        else{
            profileImgSrc=user.profileImgSrc;
        }

        await User.updateOne({
            _id:userId
        },[
            {$set:{
                profileImgSrc:profileImgSrc,
                job:job,
                adj:adj,
                introText:introText,
                location:location,
                isPublic:isPublic,
                isGraduate:isGraduate,
                position:position,
                isLocationPublic:isLocationPublic,
                resume:resume,
                workPlace:workPlace
            }}
        ])
        
       

        return res.json({
            code:200,
            message:'프로필 수정 성공',
            success:true
        })


    }
    catch(err){
        console.log(err);
        next(err);
    }
}*/







