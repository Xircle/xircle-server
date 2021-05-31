let User = require('../models/User');
let Post = require('../models/Post');
let mongoose = require('mongoose');
const moment=require('moment');
const dotenv = require('dotenv');
dotenv.config();




exports.postPost=async (req,res,next)=>{

    const userId=req.id;

    req.body.data=JSON.parse(req.body.data);

    const {articleContent,articleInterest,articleTitle}=req.body.data;
    let {articleTagArr}=req.body.data;

    if(!articleTagArr) articleTagArr=[];

    if(!articleContent){
        return res.json({
            code:439,
            success:false,
            message:'게시물을 입력해주세요'
        })
    }


    if(!articleInterest){
        return res.json({
            code:444,
            success:false,
            message:'게시물 관심사를 입력해주세요'
        })
    }

    if(!articleTitle){
        return res.json({
            code:445,
            success:false,
            message:'게시물을 입력해주세요'
        })
    }

    if(typeof(articleContent)!='string'){
        return res.json({
            code:446,
            success:false,
            message:'게시물은 문자열입니다'
        })
    }
    if(typeof(articleTitle)!='string'){
        return res.json({
            code:447,
            success:false,
            message:'게시물 제목은 문자열입니다'
        })
    }

    if(!req.file||!req.file.filename){
        return res.json({
            code:431,
            success:false,
            message:'게시물 사진을 입력해주세요'
        })
    }


    try{



        await Post.create({
            userId:userId,
            content:articleContent,
            title:articleTitle,
            uploadedPhoto:[process.env.URL+req.file.filename],
            likeUserId:[],
            hashtags:articleInterest,
            extraHashtags:articleTagArr
        })
        
        
       
        return res.json({
            code:200,
            message:'게시물 작성 성공',
            success:true
        })

    }
    catch(err){
        console.log(err);
        next(err);
    }

}




exports.getPost=async (req,res,next)=>{


    let postUserId=req.params.userId;

    const interest=req.query.interest;
    const page=req.page;

    

    if(!postUserId){
        return res.json({
            code:430,
            isSuccess:false,
            message:"유저아이디를 입력해주세요"
        })
    }
    postUserId=mongoose.mongo.ObjectId(postUserId);
    

    if(!interest){
        return res.json({
            code:445,
            success:false,
            message:'관심사를 입력해주세요'
        })
    }

  

    try{

        const postUser=await User.findOne({_id:postUserId});

        if(!postUser){
            return res.json({
                success:false,
                code:454,
                message:'없는 유저아이디입니다'
            });
        }
        

        const post=await Post.find({
            userId:postUserId,
            hashtags:{
                $elemMatch:{$eq:interest}
            }
        }).skip(8*page).limit(8).select('content createdAt title uploadedPhoto extraHashtags _id')
        
        let result=[];
      

        for(let _ of post){
            var ob={};
            ob.articleImgSrcs=_.uploadedPhoto;
            ob.postId=_._id;
            ob.articleTitle=_.title;
            ob.content=_.content;
            ob.extraHashtags=_.extraHashtags;
            ob.createdAt=moment(_.createdAt).add(9,'h').format('YY/MM/DD HH:mm');
            result.push(ob);
        }
       
        return res.json({
            code:200,
            message:'게시물 조회 성공',
            success:true,
            data:result
        })

    }
    catch(err){
        console.log(err);
        next(err);
    }

}




exports.updatePost=async (req,res,next)=>{

    const userId=req.id;

    let postId=req.params.postId;
    if(!postId){
        return res.json({
            code:448,
            success:false,
            message:'게시물 아이디를 입력해주세요'
        })
    }

    postId=mongoose.mongo.ObjectId(postId);
    req.body.data=JSON.parse(req.body.data);

    const {articleContent,articleInterest,articleTitle}=req.body.data;
    let {articleTagArr}=req.body.data;

    if(!articleTagArr) articleTagArr=[];

    if(!articleContent){
        return res.json({
            code:439,
            success:false,
            message:'게시물을 입력해주세요'
        })
    }


    if(!articleInterest){
        return res.json({
            code:444,
            success:false,
            message:'게시물 관심사를 입력해주세요'
        })
    }

    if(!articleTitle){
        return res.json({
            code:445,
            success:false,
            message:'게시물을 입력해주세요'
        })
    }

    if(typeof(articleContent)!='string'){
        return res.json({
            code:446,
            success:false,
            message:'게시물은 문자열입니다'
        })
    }
    if(typeof(articleTitle)!='string'){
        return res.json({
            code:447,
            success:false,
            message:'게시물 제목은 문자열입니다'
        })
    }




    try{


        const post=await Post.findOne({_id:postId}).select('uploadedPhoto');

        if(!post){
            return res.json({
                success:false,
                code:454,
                message:'없는 게시물아이디입니다'
            });
        }

        let articleImgSrc;

        if(req.file){
            articleImgSrc=[process.env.URL+req.file.filename];
            fs.unlinkSync(path.join(__dirname,`../../uploads/${post.uploadedPhoto[0].split('/').pop()}`));
        }
        else{
            articleImgSrc=[post.uploadedPhoto[0]];
        }
        
        await Post.findOneAndUpdate({
            userId:userId
        },{
            content:articleContent,
            title:articleTitle,
            uploadedPhoto:articleImgSrc,
            likeUserId:[],
            hashtags:articleInterest,
            extraHashtags:articleTagArr
        })
        
        
       
        return res.json({
            code:200,
            message:'게시물 수정 성공',
            success:true
        })

    }
    catch(err){
        console.log(err);
        next(err);
    }

}




exports.deletePost=async (req,res,next)=>{

    let postId=req.params.postId;
    if(!postId){
        return res.json({
            code:448,
            success:false,
            message:'게시물 아이디를 입력해주세요'
        })
    }
    postId=mongoose.mongo.ObjectId(postId);
   


    try{

        
        await Post.deleteOne({_id:postId});
        
        
       
        return res.json({
            code:200,
            message:'게시물 삭제 성공',
            success:true
        })

    }
    catch(err){
        console.log(err);
        next(err);
    }

}




exports.searchHashtag=async (req,res,next)=>{

    const userId=req.id;

    const page=req.page;
    const hashtag=req.query.hashtag;


    if(!hashtag){
        return res.json({
            code:409,
            success:false,
            message:'해시태그를 입력해주세요'
        })
    }


    try{

    
        const post=await Post.aggregate([
            {$unwind:'$extraHashtags'},
            {$match:{
                extraHashtags:{$regex:hashtag}
            }},
            {$skip:page*10},
            {$limit:10},
            {$project:{hashtag:'$extraHashtags'}}
        ]);

        const result=[];
        for(let _ of post){
            result.push(_.hashtag);
        }

        
       
        return res.json({
            code:200,
            message:'해시태그 검색 성공',
            success:true,
            data:{
                hashtag:[...new Set(result)]
            }
        })

    }
    catch(err){
        console.log(err);
        next(err);
    }

}



exports.searchPost=async (req,res,next)=>{


    const page=req.page;
    const hashtag=req.query.hashtag;



    if(!hashtag){
        return res.json({
            code:409,
            success:false,
            message:'해시태그를 입력해주세요'
        })
    }


    try{

         
        const post=await Post.aggregate([
            {$unwind:'$extraHashtags'},
            {$match:{
                extraHashtags:{$regex:hashtag}
            }},
            {$sort:{createdAt:-1}},
            {$skip:page*10},
            {$limit:10},
            {$project:{content:'$content',createdAt:'$createdAt',title:'$title',uploadedPhoto:'$uploadedPhoto'}}
        ]);

        let result=[];
        for(let _ of post){
            var ob={};
            ob.articleImgSrcs=_.uploadedPhoto;
            ob.postId=_._id;
            ob.articleTitle=_.title;
            ob.content=_.content;
            ob.createdAt=moment(_.createdAt).add(9,'h').format('YY/MM/DD HH:mm');

            const hashtags=await Post.findOne({_id:_._id}).select('extraHashtags');
            ob.extraHashtags=hashtags.extraHashtags;

            result.push(ob);
        }

        
       
        return res.json({
            code:200,
            message:'해시태그 검색 성공',
            success:true,
            data:{
                post:result
            }
        })

    }
    catch(err){
        console.log(err);
        next(err);
    }

}



