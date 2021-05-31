import express from 'express';
import {CheckEmailDto,CheckNameDto,SendEmailDto,PostUserDto,PostUserData} from '../dtos/AuthDto';
import {validationMiddleware,validationDataMiddleware} from '../utils/validation.middleware';
import HttpException from '../utils/HttpException';
import User from '../models/User';
import mongoose from 'mongoose';
import SuccessDto from '../dtos/SuccessDto';


const webMails:string[] = ["snu.ac.kr","korea.ac.kr","yonsei.ac.kr","g.skku.edu","skku.edu","sogang.ac.kr","hanyang.ac.kr","kaist.ac.kr","postech.ac.kr"];
const universitys:string[] = ["서울대학교","고려대학교","연세대학교","성균관대학교","성균관대학교","서강대학교","한양대학교","카이스트","포스텍"];
const authEmail=new Map<string,number>();


class AuthController{
    public path='/';
    public router=express.Router();

    constructor(){
        this.initializeRoutes();
    }

    public initializeRoutes(){
        this.router.post(this.path+'check/email',validationMiddleware(CheckEmailDto),this.checkEmail);
        this.router.post(this.path+'check/name',validationMiddleware(CheckNameDto),this.checkName);
        this.router.post(this.path+'email',validationMiddleware(SendEmailDto),this.sendEmail);
        this.router.post(this.path+'user',validationMiddleware(PostUserDto),validationDataMiddleware(PostUserData),this.postUser);
        
    }

        
    checkEmail=async (req:express.Request,res:express.Response,next:express.NextFunction)=>{

        const {email,code}=req.body;

        if(!webMails.includes(email.split("@")[1])){
            return next(new HttpException(412,"학교 이메일이 아닙니다"));
        }

        try{

            const user=await User.findOne({email:email}).select('_id');
            
            if(user){
                return next(new HttpException(450,"이메일 중복입니다"));
            }

            if(authEmail.get(email)!=code){
                authEmail.delete(email);
                return next(new HttpException(453,"인증번호 일치하지않습니다"));
            }

            authEmail.delete(email);
        
            return res.json(new SuccessDto("이메일 인증성공"));

        }
        catch(err){
            console.log(err);
            return next(err);
        }
    
    }

    

    checkName=async (req:express.Request,res:express.Response,next:express.NextFunction)=>{
        
        const {displayName}=req.body;

        try{
            const user=await User.findOne({displayName:displayName}).select('_id');

            if(user){
                return next(new HttpException(452,"별명 중복입니다"));
            }

            return res.json(new SuccessDto("생성가능한 이름입니다"));

        }
        catch(err){
            console.log(err);
            next(err);
        }
    }


    sendEmail=async (req:express.Request,res:express.Response,next:express.NextFunction)=>{

        const {email}=req.body;
    
            
        if(!webMails.includes(email.split("@")[1])){
            return next(new HttpException(412,"학교 이메일이 아닙니다"));
        }
    
        try{
    
            const user=await User.findOne({email:email}).select('_id');

            if(user){
                return next(new HttpException(450,"이메일 중복입니다"));
            }
    
            //client.set(email,process.env.REDIS_SECRET,'EX',90);
    
            let randomNumber=Math.floor(Math.random()*900000)+100000;
            authEmail.set(email,randomNumber);
    
            const mailjet = require ('node-mailjet')
            .connect(process.env.MAIL_JET1, process.env.MAIL_JET2);
    
            const request = mailjet
            .post("send", {'version': 'v3.1'})
            .request({
            "Messages":[
                {
                "From": {
                    "Email": "hyunjong8723@gmail.com",
                    "Name": "Xircle"
                },
                "To": [
                    {
                    "Email": email
                    }
                ],
                "Subject": "Xircle 메일",
                "HTMLPart": `
                <section style="max-width: 480px; margin: 0 auto; padding: 24px 12px 12px; border: none; background: #ffffff;">
                <div style="border: 3px solid black;"></div>
                <div style="margin-top: 50px;">
                    <h1 style="font-size: 30px; font-weight: bold; line-height: 1.5;">
                        XIRCLE <br/>
                        학교확인 인증번호 입니다.
                    </h1>
                    
                </div>
                <div>
                    <p style="font-size: 14px; line-height: 28px; ">안녕하세요. 새로운 네트워킹 서비스 XIRCLE을 이용해 주셔서 감사합니다. <span style="font-weight: 700;">${universitys[webMails.indexOf(email.split('@')[1])]} 인증을 완료하기 위해 아래 인증번호를 입력해주세요.</span> 한 번의 인증으로 XIRCLE을 경험해보세요!</p>
                </div>
                <div style="text-align: center; margin-top: 100px;">
                    <div style="background-color: #1F1F1F; padding: 20px 120px; border-radius: 13px; outline-style: none;">
                        <span style="color: white; font-size: 22px; font-weight: 700;">${randomNumber}</span>
                    </div>
                </div>
                <div style="text-align: center; margin: 50px 0;">
                    <p style="font-weight: 300;">문제가 있을 경우 카카오톡 채널[XIRCLE]로 문의주세요.</p>
                    <a style="color: #BFBFBF; font-size: 20px; font-weight: 700; text-decoration: none; " href="https://pf.kakao.com/_kDxhtK">고객센터 바로가기</a>
                </div>
            </section>
        
                `
                }
            ]
            })

            request
            .catch(() => {
                return next(new HttpException(451,"메일전송 실패입니다"));
            });
            
    
            return res.json(new SuccessDto("메일전송 성공입니다"));
    
        }
        catch(err){
            console.log(err);
            next(err);
        }
    }

    

    postUser=async (req:express.Request,res:express.Response,next:express.NextFunction)=>{
        try{


            return res.json(new SuccessDto("유저 등록 성공"));
        }
        catch(err){
            console.log(err);
            next(err);
        }
    }
    


}

export default AuthController;




/*

let User = require('../models/User');
let Post = require('../models/Post');
let mongoose = require('mongoose');

const dotenv = require('dotenv');
dotenv.config();
const regexEmail = require('regex-email');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const {startSession}=require('mongoose');
//const fs=require('fs');
//const path=require('path');
//const redis=require('redis');
//const client=redis.createClient(process.env.REDIS_URL);

const {encrypt,decrypt}=require('../utils/function');


let authEmail=new Map();

exports.checkEmail=async (req,res,next)=>{
    const {email,code}=req.body;

    if(!email){
        return res.json({
            success:false,
            code:410,
            message:"이메일을 입력해주세요"
        })
    }

    if (!regexEmail.test(email)){
        return res.json({
            success: false, 
            code: 411, 
            message: "이메일을 형식을 정확하게 입력해주세요"
        });
    }

    if(!webMails.includes(email.split("@")[1])){
        return res.json({
            success:false,
            code:412,
            message:"학교 이메일이 아닙니다"
        })
    }

    

    try{

        const user=await User.findOne({
            email:email
        });
        if(user){
            return res.json({
                success:false,
                code:450,
                message:"이메일 중복입니다"
            })
        }

       

        if(authEmail.get(email)!=code){
            authEmail.delete(email);
            return res.json({
                success:false,
                code:453,
                message:'인증번호 일치하지않습니다'
            })
        }

        authEmail.delete(email);
    
        return res.json({
            message:'이메일 인증성공',
            success:true,
            code:200
        });
          
        
        
        
        // client.get(email,(err,value)=>{
        //     if(err) throw err;

        
        //     if(value===process.env.REDIS_SECRET){
        //         return res.json({
        //             message:'이메일 인증성공',
        //             success:true,
        //             code:200
        //         });
        //     }

        //     else{
        //         return res.json({
        //             message:'이메일 인증실패',
        //             success:false,
        //             code:453
        //         })
        //     }
        // });
        
    }
    catch(err){
        console.log(err);
        next(err);
    }
}

exports.sendEmail=async (req,res,next)=>{

    const {email}=req.body;

    if(!email){
        return res.json({
            success:false,
            code:410,
            message:"이메일을 입력해주세요"
        })
    }

    if (!regexEmail.test(email)){
        return res.json({
            success: false, 
            code: 411, 
            message: "이메일을 형식을 정확하게 입력해주세요"
        });
    }

    
    if(!webMails.includes(email.split("@")[1])){
        return res.json({
            success:false,
            code:412,
            message:"학교 이메일이 아닙니다"
        })
    }

    try{

        const user=await User.findOne({
            email:email
        });
        if(user){
            return res.json({
                success:false,
                code:450,
                message:"이메일 중복입니다"
            })
        }

        // let transporter = nodemailer.createTransport({
        //     service: 'gmail',
        //     auth: {
        //         user: process.env.GOOGLE_ACCOUNT,
        //         pass: process.env.GOOGLE_PASSWORD
        //     }
        // });

        

        //let source=fs.readFileSync(path.join(__dirname,'../../public','authMail.html'),'utf8');
        //client.set(email,process.env.REDIS_SECRET,'EX',90);


        
        let randomNumber=Math.floor(Math.random()*900000)+100000;
        authEmail.set(email,randomNumber);


        const mailjet = require ('node-mailjet')
        .connect(process.env.MAIL_JET1, process.env.MAIL_JET2);

        const request = mailjet
        .post("send", {'version': 'v3.1'})
        .request({
        "Messages":[
            {
            "From": {
                "Email": "hyunjong8723@gmail.com",
                "Name": "Xircle"
            },
            "To": [
                {
                "Email": email
                }
            ],
            "Subject": "Xircle 메일",
            "HTMLPart": `
            <section style="max-width: 480px; margin: 0 auto; padding: 24px 12px 12px; border: none; background: #ffffff;">
            <div style="border: 3px solid black;"></div>
            <div style="margin-top: 50px;">
                <h1 style="font-size: 30px; font-weight: bold; line-height: 1.5;">
                    XIRCLE <br/>
                    학교확인 인증번호 입니다.
                </h1>
                
            </div>
            <div>
                <p style="font-size: 14px; line-height: 28px; ">안녕하세요. 새로운 네트워킹 서비스 XIRCLE을 이용해 주셔서 감사합니다. <span style="font-weight: 700;">${universitys[webMails.indexOf(email.split('@')[1])]} 인증을 완료하기 위해 아래 인증번호를 입력해주세요.</span> 한 번의 인증으로 XIRCLE을 경험해보세요!</p>
            </div>
            <div style="text-align: center; margin-top: 100px;">
                <div style="background-color: #1F1F1F; padding: 20px 120px; border-radius: 13px; outline-style: none;">
                    <span style="color: white; font-size: 22px; font-weight: 700;">${randomNumber}</span>
                </div>
            </div>
            <div style="text-align: center; margin: 50px 0;">
                <p style="font-weight: 300;">문제가 있을 경우 카카오톡 채널[XIRCLE]로 문의주세요.</p>
                <a style="color: #BFBFBF; font-size: 20px; font-weight: 700; text-decoration: none; " href="https://pf.kakao.com/_kDxhtK">고객센터 바로가기</a>
            </div>
        </section>
    
            `
            }
        ]
        })
        request
        .then((result) => {
            return res.json({
                code:200,
                success: true,
                message: '메일전송 성공입니다'
            });
        })
        .catch((err) => {
            return res.json({
                code:451,
                success: false,
                message: '메일전송 실패입니다'
            });
        })
        

        return res.json({
            code:200,
            success: true,
            message: '메일전송 성공입니다'
        });

    }
    catch(err){
        console.log(err);
        next(err);
    }
}



exports.checkName=async (req,res,next)=>{

    const {displayName}=req.body;
    if(!displayName){
        return res.json({
            code:423,
            success:false,
            message:'별명을 입력해주세요'
        })
    }
    if(typeof(displayName)!='string'){
        return res.json({
            code:424,
            success:false,
            message:'별명은 문자열입니다'
        })
    }
    
    try{
        const user=await User.findOne({
            displayName:displayName
        });

        if(user){
            return res.json({
                code:452,
                success:false,
                message:"별명 중복입니다"
            })
        }

        return res.json({
            code:200,
            success:true,
            message:"생성가능한 이름입니다"
        })

    }
    catch(err){
        console.log(err);
        next(err);
    }
}


exports.postUser=async (req,res,next)=>{

    req.body.data=JSON.parse(req.body.data);

    const {
       
        age,
        gender,
        job,
        adj,
        displayName,
        email,
        location,
        phoneNumber,
        isPublic,
        isGraduate,
        latitude,
        longitude,
        interestArr,
    } = req.body.data;

    let {password}=req.body.data; 


    if(!interestArr){
        return res.json({
            code:427,
            success:false,
            message:'관심사를 입력해주세요'
        })
         
    }


   
  

    
    let position=[];
    if(longitude) position.push(longitude);
    if(latitude) position.push(latitude);
   




    if(age===undefined||age===null){
        return res.json({
            code:413,
            success:false,
            message:'나이를 입력해주세요'
        })
    }
    
    if(typeof(age)!='number'){
        return res.json({
            code:414,
            success:false,
            message:'나이는 숫자입니다'
        })
    }

    if(!gender){
        return res.json({
            code:415,
            success:false,
            message:'성별을 입력해주세요'
        })
    }
    if(typeof(gender)!='string'){
        return res.json({
            code:416,
            success:false,
            message:'성별은 문자열입니다'
        })
    }
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
    if(!displayName){
        return res.json({
            code:423,
            success:false,
            message:'별명을 입력해주세요'
        })
    }
    if(typeof(displayName)!='string'){
        return res.json({
            code:424,
            success:false,
            message:'별명은 문자열입니다'
        })
    }
    if(!email){
        return res.json({
            success:false,
            code:410,
            message:"이메일을 입력해주세요"
        })
    }

    if (!regexEmail.test(email)){
        return res.json({
            success: false, 
            code: 411, 
            message: "이메일을 형식을 정확하게 입력해주세요"
        });
    }

    if(!webMails.includes(email.split("@")[1])){
        return res.json({
            success:false,
            code:412,
            message:"학교 이메일이 아닙니다"
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
    if(!phoneNumber){
        return res.json({
            code:425,
            success:false,
            message:'전화번호를 입력해주세요'
        })
    }
    if(typeof(phoneNumber)!='string'){
        return res.json({
            code:426,
            success:false,
            message:'전화번호를 문자열입니다'
        })
    }

    if(!req.file||!req.file.filename){
        return res.json({
            code:431,
            success:false,
            message:'프로필 사진을 입력해주세요'
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

    
    if(typeof(isPublic)!='boolean'){
        return res.json({
            code:434,
            success:false,
            message:'공개여부는 boolean형입니다'
        })
    }

    
    if(typeof(isGraduate)!='boolean'){
        return res.json({
            code:435,
            success:false,
            message:'졸업여부는 boolean형입니다'
        })
    }

    if(!password){
        return res.json({
            code:436,
            success:false,
            message:'비밀번호를 입력해주세요'
        })
    }

    if(typeof(password)!='string'){
        return res.json({
            code:437,
            success:false,
            message:'비밀번호는 문자열입니다'
        })
    }


   

        
    const university=universitys[webMails.indexOf(email.split('@')[1])];

    password=encrypt(password);

    
    try{



        const user=await User.create({
            age:age,
            gender:gender,
            university:university,
            adj:adj,
            job:job,
            profileImgSrc:process.env.URL+req.file.filename,
            introText:"",
            displayName:displayName,
            email:email,
            phoneNumber:phoneNumber,
            isPublic:isPublic,
            isGraduate:isGraduate,
            location:location,
            hashtags:interestArr,
            mainHashtags:interestArr,
            followings:[],
            followers:[],
            blockedUsers:[],
            resume:"",
            workPlace:"",
            password:password,
            position:position,
            isLocationPublic:true
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

exports.login=async (req,res,next)=>{
    const {password,displayName}=req.body;

    
    
    if(!password){
        return res.json({
            code:436,
            success:false,
            message:'비밀번호를 입력해주세요'
        })
    }

    if(typeof(password)!='string'){
        return res.json({
            code:437,
            success:false,
            message:'비밀번호는 문자열입니다'
        })
    }

    if(!displayName){
        return res.json({
            code:423,
            success:false,
            message:'별명을 입력해주세요'
        })
    }
    if(typeof(displayName)!='string'){
        return res.json({
            code:424,
            success:false,
            message:'별명은 문자열입니다'
        })
    }


    try{

        const user=await User.findOne({displayName:displayName}).select('_id password');
        if(!user){
            return res.json({
                code:455,
                success:false,
                message:'존재하지않는 별명입니다'
            })
        }
   
        if(password===decrypt(user.password)){

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
                success:true,
                message:'로그인 성공',
                data:{
                    token:token,
                    userId:user._id
                }
            })
        }
        else{

            return res.json({
                code:456,
                success:false,
                message:'비밀번호 불일치'
            })

        }


    }
    catch(err){
        console.log(err);
        next(err);
    }
}



exports.findInfo=async (req,res,next)=>{
    const {email}=req.body;

    if(!email){
        return res.json({
            success:false,
            code:410,
            message:"이메일을 입력해주세요"
        })
    }

    if (!regexEmail.test(email)){
        return res.json({
            success: false, 
            code: 411, 
            message: "이메일을 형식을 정확하게 입력해주세요"
        });
    }

    if(!webMails.includes(email.split("@")[1])){
        return res.json({
            success:false,
            code:412,
            message:"학교 이메일이 아닙니다"
        })
    }


    try{

        const emailExist=await User.findOne({email:email});
        if(!emailExist){
            return res.json({
                success:false,
                code:457,
                message:"가입되지않은 이메일입니다"
            })
        }

        
        const mailjet = require ('node-mailjet')
        .connect(process.env.MAIL_JET1, process.env.MAIL_JET2);

        const request = mailjet
        .post("send", {'version': 'v3.1'})
        .request({
        "Messages":[
            {
            "From": {
                "Email": "hyunjong8723@gmail.com",
                "Name": "Xircle"
            },
            "To": [
                {
                "Email": email
                }
            ],
            "Subject": "Xircle 메일",
            "HTMLPart": `
            <section style="max-width: 480px; margin: 0 auto; padding: 24px 12px 12px; border: none; background: #ffffff;">
            <div style="border: 3px solid black;"></div>
            <div style="margin-top: 50px;">
                <h1 style="font-size: 30px; font-weight: bold; line-height: 1.5;">
                    XIRCLE <br/>
                    기존의 닉네임과 비밀번호 입니다.
                </h1>
                
            </div>
            <div>
                <p style="font-size: 15px; line-height: 1.5;">안녕하세요. 새로운 네트워킹 서비스 XIRCLE을 이용해 주셔서 감사합니다. <br/> 로그인을 진행해 주세요 :)</p>
            </div>
            <div style="text-align: center; margin-top: 100px;">
                <div style="background-color: #F7F7FA; padding: 20px 120px; margin: 20px 0; border-radius: 13px; outline-style: none;">
                    <span style="font-size: 22px; font-weight: 700;">${emailExist.displayName}</span>
                </div>
                <div style="background-color: #1F1F1F; padding: 20px 120px; border-radius: 13px; outline-style: none;">
                    <span style="color: white; font-size: 22px; font-weight: 700;">${decrypt(emailExist.password)}</span>
                </div>
            </div>
            <div style="text-align: center; margin: 50px 0;">
                <p style="font-weight: 300;"> 문제가 있을 경우 카카오톡 채널[XIRCLE]로 문의주세요.</p>
                <a style="color: #BFBFBF; font-size: 20px; font-weight: 700; text-decoration: none; " href="https://pf.kakao.com/_kDxhtK">고객센터 바로가기</a>
            </div>
        </section>
    
            `  
            }
        ]
        })

        
        request
        .then((result) => {
            return res.json({
                code:200,
                success: true,
                message: '메일전송 성공입니다'
            });
        })
        .catch((err) => {
            return res.json({
                code:451,
                success: false,
                message: '메일전송 실패입니다'
            });
        })


        return res.json({
            code:200,
            success: true,
            message: '메일전송 성공입니다'
        });
      

    }
    catch(err){
        console.log(err);
        next(err);
    }
}
*/

