let User = require('../models/User');
let Post = require('../models/Post');
let mongoose = require('mongoose');


const dotenv = require('dotenv');
dotenv.config();
const {startSession}=require('mongoose');




exports.follow=async (req,res,next)=>{
   
    const followId=mongoose.mongo.ObjectId(req.params.userId);
    const userId=req.id;

    if(!followId){
        return res.json({
            success:false,
            code:429,
            message:"유저아이디를 입력해주세요"
        })
    }

    const session=await startSession();

    try{

        session.startTransaction();

        const user=await User.findOne({_id:followId});

        if(!user){
            return res.json({
                success:false,
                code:454,
                message:'없는 유저아이디입니다'
            });
        }
        

        const follow=await User.findOne({
            _id:userId,
            followings:{
                $elemMatch:{$eq:followId}
            }
        });
       

        if(!follow){
            await User.findOneAndUpdate(
                {_id:userId},
                {$push:{followings:followId}},
                {session}
            );
          

           await User.findOneAndUpdate(
                {_id:followId},
                {$push:{followers:userId}},
                {session}
            );
           

        }
        else{
            await User.findOneAndUpdate(
                {_id:userId},
                {$pull:{followings:followId}},
                {session}
            );
            

            await User.findOneAndUpdate(
                {_id:followId},
                {$pull:{followers:userId}},
                {session}
            );
            
        }
        
        
        await session.commitTransaction();
        session.endSession();

        return res.json({
            success:true,
            code:200,
            message:'팔로우/언팔로우 성공'
        });


    }
    catch(err){
        await session.abortTransaction();
        session.endSession();
        console.log(err);
        next(err);
    }
}





exports.getUsers=async (req,res,next)=>{
   
    const userId=req.id;
    let {page,age,university,location,gender}=req.query;

    
    if(location){
        let regexp=/[^0-9]/g;
        let regres=location.search(regexp);
        if(regres!=-1){
            return res.json({
                code:461,
                isSuccess:false,
                message:"거리는 숫자입니다"
            })
        }
        location=Number(location);
    
    }
    let age_s,age_e;
    if(age){
        let ages=['20초','20중','20후','30초','30중','30후','40대','50대']
        if(!ages.includes(age)){
            return res.json({
                success:false,
                code:460,
                message:'유효한 나이를 입력해주세요'
            });
        }

        if(age==='20초'){
            age_s=20;
            age_e=23;
        }
        else if(age==='20중'){
            age_s=24;
            age_e=26;
        }
        else if(age==='20후'){
            age_s=27;
            age_e=29;
        }
        else if(age==='30초'){
            age_s=30;
            age_e=33;
        }
        else if(age==='30중'){
            age_s=34;
            age_e=36;
        }
        else if(age==='30후'){
            age_s=37;
            age_e=39;
        }
        else if(age==='40대'){
            age_s=40;
            age_e=49;
        }
        else if(age==='50대'){
            age_s=50;
            age_e=59;
        }
    }

    if(university){
        let universitys=["서울대","고려대","연세대","성균관대","서강대","한양대"];
        if(!universitys.includes(university)){
            return res.json({
                success:false,
                code:462,
                message:'유효한 대학을 입력해주세요'
            });
        }
        university=university+'학교';
    }

    if(gender){
        if(gender!='남'&&gender!='여'){
            return res.json({
                success:false,
                code:459,
                message:'유효한 성별을 입력해주세요'
            });
        }
    }

    if(!page){
        return res.json({
            success:false,
            code:430,
            message:'페이지를 입력해주세요'
        });
    }
    page=Number(page);

    

    try{

        const user=await User.findOne({_id:userId}).select('hashtags position');

        const hashtags=user.hashtags;
        const position=user.position;

        if(!user){
            return res.json({
                success:false,
                code:454,
                message:'없는 유저아이디입니다'
            });
        }

        if(location){   
            if(user.position.length<1){
                return res.json({
                    success:false,
                    code:458,
                    message:'위치를 허용해주세요'
                });
            }
        }




        let users;

        if(!age&&!university&&!location&&!gender){

            users=await User.aggregate([
                {$unwind:'$hashtags'},
                {$match:{
                    _id:{$ne:userId},
                    hashtags:{$in:hashtags}
                }},
                {$group:{_id:'$_id',nb:{'$sum':1}}},
                {$sort:{nb:-1,_id:1}},
                {$skip:page*10},
                {$limit:10},
                {$project:{_id:'$_id',nb:'$nb'}}
            ]);


        }
        else if(age&&!university&&!location&&!gender){

            users=await User.aggregate([
                {$unwind:'$hashtags'},
                {$match:{
                    _id:{$ne:userId},
                    age:{$gte:age_s,$lte:age_e},
                    hashtags:{$in:hashtags}
                }},
                {$group:{_id:'$_id',nb:{'$sum':1}}},
                {$sort:{nb:-1,_id:1}},
                {$skip:page*10},
                {$limit:10},
                {$project:{_id:'$_id',nb:'$nb'}}
            ]);
        }
        else if(!age&&university&&!location&&!gender){

            users=await User.aggregate([
                {$unwind:'$hashtags'},
                {$match:{
                    _id:{$ne:userId},
                    university:{$eq:university},
                    hashtags:{$in:hashtags},
                    
                }},
                {$group:{_id:'$_id',nb:{'$sum':1}}},
                {$sort:{nb:-1,_id:1}},
                {$skip:page*10},
                {$limit:10},
                {$project:{_id:'$_id',nb:'$nb'}}
            ]);

        }
        else if(!age&&!university&&location&&!gender){

            users=await User.aggregate([
                {
                    $geoNear: {
                        near: { type: "Point", coordinates:position },
                        distanceField: "dis.cal",
                        maxDistance: location,
                        spherical: true
                    }
                },
                {$unwind:'$hashtags'},
                {$match:{
                    _id:{$ne:userId},
                    hashtags:{$in:hashtags}
                }},
                {$group:{_id:'$_id',nb:{'$sum':1}}},
                {$sort:{nb:-1,_id:1}},
                {$skip:page*10},
                {$limit:10},
                {$project:{_id:'$_id',nb:'$nb'}}
            ]);

        }
        else if(!age&&!university&&!location&&gender){

            users=await User.aggregate([
                {$unwind:'$hashtags'},
                {$match:{
                    _id:{$ne:userId},
                    gender:{$eq:gender},
                    hashtags:{$in:hashtags}
                }},
                {$group:{_id:'$_id',nb:{'$sum':1}}},
                {$sort:{nb:-1,_id:1}},
                {$skip:page*10},
                {$limit:10},
                {$project:{_id:'$_id',nb:'$nb'}}
            ]);

        }
        else if(age&&university&&!location&&!gender){

            users=await User.aggregate([
                {$unwind:'$hashtags'},
                {$match:{
                    _id:{$ne:userId},
                    university:{$eq:university},
                    age:{$gte:age_s,$lte:age_e},
                    hashtags:{$in:hashtags}
                }},
                {$group:{_id:'$_id',nb:{'$sum':1}}},
                {$sort:{nb:-1,_id:1}},
                {$skip:page*10},
                {$limit:10},
                {$project:{_id:'$_id',nb:'$nb'}}
            ]);

        }

        else if(age&&!university&&location&&!gender){

            users=await User.aggregate([
                {
                    $geoNear: {
                        near: { type: "Point", coordinates:position },
                        distanceField: "dis.cal",
                        maxDistance: location,
                        spherical: true
                    }
                },
                {$unwind:'$hashtags'},
                {$match:{
                    _id:{$ne:userId},
                    age:{$gte:age_s,$lte:age_e},
                    hashtags:{$in:hashtags}
                }},
                {$group:{_id:'$_id',nb:{'$sum':1}}},
                {$sort:{nb:-1,_id:1}},
                {$skip:page*10},
                {$limit:10},
                {$project:{_id:'$_id',nb:'$nb'}}
            ]);

        }
        else if(age&&!university&&!location&&gender){


            users=await User.aggregate([
                {$unwind:'$hashtags'},
                {$match:{
                    _id:{$ne:userId},
                    age:{$gte:age_s,$lte:age_e},
                    gender:{$eq:gender},
                    hashtags:{$in:hashtags},
                }},
                {$group:{_id:'$_id',nb:{'$sum':1}}},
                {$sort:{nb:-1,_id:1}},
                {$skip:page*10},
                {$limit:10},
                {$project:{_id:'$_id',nb:'$nb'}}
            ]);
        }

        else if(!age&&university&&location&&!gender){


            users=await User.aggregate([
                {
                    $geoNear: {
                        near: { type: "Point", coordinates:position },
                        distanceField: "dis.cal",
                        maxDistance: location,
                        spherical: true
                    }
                },
                {$unwind:'$hashtags'},
                {$match:{
                    _id:{$ne:userId},
                    university:{$eq:university},
                    hashtags:{$in:hashtags}
                }},
                {$group:{_id:'$_id',nb:{'$sum':1}}},
                {$sort:{nb:-1,_id:1}},
                {$skip:page*10},
                {$limit:10},
                {$project:{_id:'$_id',nb:'$nb'}}
            ]);
        }

        else if(!age&&university&&!location&&gender){

            users=await User.aggregate([
                {$unwind:'$hashtags'},
                {$match:{
                    _id:{$ne:userId},
                    university:{$eq:university},
                    gender:{$eq:gender},
                    hashtags:{$in:hashtags}
                }},
                {$group:{_id:'$_id',nb:{'$sum':1}}},
                {$sort:{nb:-1,_id:1}},
                {$skip:page*10},
                {$limit:10},
                {$project:{_id:'$_id',nb:'$nb'}}
            ]);

        }
        else if(!age&&!university&&location&&gender){

            users=await User.aggregate([
                {
                    $geoNear: {
                        near: { type: "Point", coordinates:position },
                        distanceField: "dis.cal",
                        maxDistance: location,
                        spherical: true
                    }
                },
                {$unwind:'$hashtags'},
                {$match:{
                    _id:{$ne:userId},
                    gender:{$eq:gender},
                    hashtags:{$in:hashtags}
                }},
                {$group:{_id:'$_id',nb:{'$sum':1}}},
                {$sort:{nb:-1,_id:1}},
                {$skip:page*10},
                {$limit:10},
                {$project:{_id:'$_id',nb:'$nb'}}
            ]);

        }
        else if(age&&university&&location&&!gender){

            users=await User.aggregate([
                {
                    $geoNear: {
                        near: { type: "Point", coordinates:position },
                        distanceField: "dis.cal",
                        maxDistance: location,
                        spherical: true
                    }
                },
                {$unwind:'$hashtags'},
                {$match:{
                    _id:{$ne:userId},
                    age:{$gte:age_s,$lte:age_e},
                    university:{$eq:university},
                    hashtags:{$in:hashtags}
                }},
                {$group:{_id:'$_id',nb:{'$sum':1}}},
                {$sort:{nb:-1,_id:1}},
                {$skip:page*10},
                {$limit:10},
                {$project:{_id:'$_id',nb:'$nb'}}
            ]);

        }
        else if(age&&university&&!location&&gender){

            users=await User.aggregate([
        
                {$unwind:'$hashtags'},
                {$match:{
                    _id:{$ne:userId},
                    age:{$gte:age_s,$lte:age_e},
                    university:{$eq:university},
                    gender:{$eq:gender},
                    hashtags:{$in:hashtags}
                }},
                {$group:{_id:'$_id',nb:{'$sum':1}}},
                {$sort:{nb:-1,_id:1}},
                {$skip:page*10},
                {$limit:10},
                {$project:{_id:'$_id',nb:'$nb'}}
            ]);

        }
        else if(age&&!university&&location&&gender){

            users=await User.aggregate([
                {
                    $geoNear: {
                        near: { type: "Point", coordinates:position },
                        distanceField: "dis.cal",
                        maxDistance: location,
                        spherical: true
                    }
                },
                {$unwind:'$hashtags'},
                {$match:{
                    _id:{$ne:userId},
                    age:{$gte:age_s,$lte:age_e},
                    gender:{$eq:gender},
                    hashtags:{$in:hashtags}
                }},
                {$group:{_id:'$_id',nb:{'$sum':1}}},
                {$sort:{nb:-1,_id:1}},
                {$skip:page*10},
                {$limit:10},
                {$project:{_id:'$_id',nb:'$nb'}}
            ]);

        }
        else if(!age&&university&&location&&gender){

            users=await User.aggregate([
                {
                    $geoNear: {
                        near: { type: "Point", coordinates:position },
                        distanceField: "dis.cal",
                        maxDistance: location,
                        spherical: true
                    }
                },
                {$unwind:'$hashtags'},
                {$match:{
                    _id:{$ne:userId},
                    university:{$eq:university},
                    gender:{$eq:gender},
                    hashtags:{$in:hashtags}
                }},
                {$group:{_id:'$_id',nb:{'$sum':1}}},
                {$sort:{nb:-1,_id:1}},
                {$skip:page*10},
                {$limit:10},
                {$project:{_id:'$_id',nb:'$nb'}}
            ]);

        }
        else if(age&&university&&location&&gender){

            users=await User.aggregate([
                {
                    $geoNear: {
                        near: { type: "Point", coordinates:position },
                        distanceField: "dis.cal",
                        maxDistance: location,
                        spherical: true
                    }
                },
                {$unwind:'$hashtags'},
                {$match:{
                    _id:{$ne:userId},
                    age:{$gte:age_s,$lte:age_e},
                    university:{$eq:university},
                    gender:{$eq:gender},
                    hashtags:{$in:hashtags}
                }},
                {$group:{_id:'$_id',nb:{'$sum':1}}},
                {$sort:{nb:-1,_id:1}},
                {$skip:page*10},
                {$limit:10},
                {$project:{_id:'$_id',nb:'$nb'}}
            ]);

        }

        let usersInfo=[]; 
        
        for(let _ of users){
            
            let ob={};
            let userInfo=await User.findOne({_id:_._id}).select('profileUrl adj job introText gender displayName profileImgSrc position age university');
            ob.profileImgSrc=userInfo.profileImgSrc;
            ob.adj=userInfo.adj;
            ob.job=userInfo.job;
            ob.introText=userInfo.introText;
            ob.gender=userInfo.gender;
            ob.displayName=userInfo.displayName;
            ob.profileImgSrc=userInfo.profileImgSrc;
            ob.sameInterest=_.nb;
            ob.userId=_._id;
            ob.position=userInfo.position;
    

            usersInfo.push(ob);
        }

    
        return res.json({
            success:true,
            code:200,
            message:'사용자 조회 성공',
            data:usersInfo
        });


    }
    catch(err){
        console.log(err);
        next(err);
    }
}