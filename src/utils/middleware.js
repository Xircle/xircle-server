const multer = require('multer');
const path=require('path');


const sharp=require('sharp');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const fs=require('fs');
const {promisify}=require('util');
let User = require('../models/User');
let mongoose = require('mongoose');

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
exports.upload=upload;

const resize=async(req,res,next)=>{

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
        next(err);
    }

}

exports.resize=resize;




const verify = async (req, res, next) => {
    
    const token = req.headers['access-token'];
    
    if(!token) {
        return res.json({
            success:false,
            code: 401,
            message: '로그인이 되어 있지 않습니다.'
        });
    }

    try{

        const verify=promisify(jwt.verify);
        const verifiedToken=await verify(token,process.env.JWT_SECRET);

        const userId=await User.findOne({_id:verifiedToken.id}).select('_id');

        if(userId._id){
            req.id=mongoose.mongo.ObjectId(userId._id);
            next();
        }
        else{
            return res.json({
                success:false,
                code:454,
                message:'없는 유저아이디입니다'
            });
        }

    }
    catch(err){
        console.log(err);
        return res.json({
            success:false,
            code:401,
            message:'검증실패'
        })
    }

};

exports.verify = verify;



const pager = async (req, res, next) => {

    let page=req.query.page;

    if(!page){
        return res.json({
            code:430,
            isSuccess:false,
            message:"페이지 번호를 입력해주세요"
        })
    }

    let regexp=/[^0-9]/g;
    let regres=page.search(regexp);
    if(regres!=-1){
        return res.json({
            code:449,
            isSuccess:false,
            message:"페이지 번호는 숫자입니다"
        })
    }
    page=Number(page);

    req.page=page;

    next();

};

exports.pager=pager;
