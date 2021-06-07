import express from 'express';
import multer from 'multer';
import path from 'path';
import sharp from 'sharp';
import jwt from 'jsonwebtoken';
import 'dotenv/config'
import fs from 'fs';
import {promisify} from 'util';
import User from '../models/User';
import mongoose from 'mongoose';
import HttpException from './HttpException';



const upload=multer({
    storage:multer.diskStorage({
        destination(req,file,cb){
            cb(null,'uploads/');
        },
        filename(req,file,cb){
            cb(null,new Date().valueOf()+path.extname(file.originalname));
        }
    }),
    limits:{fileSize:1024*1024*10},
    
})

const resize=async(req:express.Request,res:express.Response,next:express.NextFunction)=>{

    try{

        if(req.file){

            const type=req.file.filename.split('.').pop();
            const types=['jpg','jpeg','png','JPG','JPEG','PNG']
            const filepath=req.file.path;

            if(types.includes(type)){
                await sharp(filepath,{failOnError:false})
                .metadata()
                .then(({ width }) => sharp(filepath,{failOnError:false})
                .resize(Math.round(width * 0.7))
                .withMetadata()
                .toFile(path.join('uploads','7r'+req.file.filename)))
                .then(global.gc);

                fs.unlinkSync(filepath);
                
                req.file.filename='7r'+req.file.filename;
            }
        }
        next();
    }
    catch(err){
        console.log(err);
        return next(err);
    }

}



const verify = async (req:express.Request, res:express.Response, next:express.NextFunction) => {


    const token = <string> req.headers['access-token'];
    if(!token) {
        if(!req.headers){
            return next(new HttpException(401,'로그인 되어 있지 않습니다.'))
        }
    }

    try{

        const verify=promisify((token:string,key:string,callback:any)=>{
            jwt.verify(token,key,(err)=>{callback(err)});
        });

        const verifiedToken:any=await verify(token,process.env.JWT_SECRET);


        const userId=await User.findOne({_id:verifiedToken.id}).select('_id');

        if(userId._id){
            res.locals.id=userId._id;
            next();
        }
        else{
            return next(new HttpException(454,'없는 유저아이디입니다.'))
        }

    }
    catch(err){
        console.log(err);
        return next(err);
    }

};





const pager = async (req:express.Request, res:express.Response, next:express.NextFunction) => {

    const page = <string> req.query.page;

    if(!page){
        return next(new HttpException(430,'페이지 번호를 입력해주세요'))
    }

    const regres:number=page.search(/[^0-9]/g);
    if(regres!=-1){
        return next(new HttpException(449,'페이지 번호는 숫잡입니다'))
    }
    const pageNum=Number(page);

    res.locals.pageNum=pageNum;
    next();

};

export {pager,verify,resize,upload}
