import User from '../models/User';
import Post from '../models/Post';
import { startSession } from 'mongoose';
import { encrypt, decrypt } from '../utils/function';
import sharp from 'sharp';

export const getUser = async (req, res, next) => {

    const {
        page
    } = Number(req.query);
    try {
        const users = await User.find()
            .skip(page * 10)
            .limit(10);
        res.render('user.ejs', {
            users: users
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
}


export const getHashtag = async (req, res, next) => {

    const { page } = Number(req.query);
    try {
        const hashtags = await Hashtag.find()
            .skip(page * 10)
            .limit(10);
        res.render('hashtag.ejs', {
            hashtags: hashtags
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
}


export const getPost = async (req, res, next) => {

    const page = Number(req.query.page);

    try {
        const posts = await Post.find()
            .skip(page * 10)
            .limit(10);
        res.render('post.ejs', {
            posts: posts
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
}


export const postUser = async (req, res, next) => {

    const {
        body: {
            age,
            gender,
            university,
            adj,
            job,
            introText,
            displayName,
            email,
            location,
            isPublic,
            password,
            isGraduate,
            phoneNumber
        }
    } = req;

    let hashtags;
    if (!Object.prototype.hasOwnProperty.call(req.body, 'interestArr')) {
        hashtags = [];
    } else {
        hashtags = req.body.interestArr;
    }


    let fileUrl;
    if (Object.prototype.hasOwnProperty.call(req, 'file') && Object.prototype.hasOwnProperty.call(req.file, 'location')) {
        fileUrl = req.file['location'];
    }

    try {

        await User.create([{
            age: age,
            gender: gender,
            adj: adj,
            university: university,
            job: job,
            profileImgSrc: fileUrl,
            introText: introText,
            displayName: displayName,
            email: email,
            location: location,
            hashtags: hashtags,
            mainHashtags: hashtags,
            isPublic: isPublic,
            followings: [],
            followers: [],
            password: password,
            isGraduate: isGraduate,
            phoneNumber: phoneNumber,
            resume: resume,
            workPlace: workPlace
        }]);


        return res.json({
            code: 200,
            success: true,
            message: '유저 등록 추가 성공'
        })
    } catch (err) {

        console.log(err);
        next(err);
    }
}

export const patchUser = async (req, res, next) => {

    const { userId } = req.params;

    const {
        body: {
            age,
            gender,
            university,
            adj,
            job,
            introText,
            displayName,
            email,
            location,
            isPublic,
            resume,
            workPlace,
            phoneNumber,
            isGraduate,
            password,
        }
    } = req;



    let hashtags;
    if (!Object.prototype.hasOwnProperty.call(req.body, 'interestArr')) {
        hashtags = [];
    } else {
        hashtags = req.body.hashtags;
    }

    let fileUrl;
    if (Object.prototype.hasOwnProperty.call(req, 'file') && Object.prototype.hasOwnProperty.call(req.file, 'location')) {
        fileUrl = req.file['location'];
    }



    try {

        await User.findByIdAndUpdate(userId, {
            age: age,
            gender: gender,
            adj: adj,
            university: university,
            job: job,
            profileImgSrc: fileUrl,
            introText: introText,
            displayName: displayName,
            email: email,
            location: location,
            hashtags: hashtags,
            isPublic: isPublic,
            phoneNumber: phoneNumber,
            resume: resume,
            workPlace: workPlace,
            isGraduate: isGraduate,
            password: password
        });

        return res.json({
            code: 200,
            success: true,
            message: '유저 정보 변경 성공'
        })
    } catch (err) {

        console.log(err);
        next(err);
    }
}

export const deleteUser = async (req, res, next) => {

    const { userId } = req.params;

    try {

        await User.findByIdAndDelete(userId);

        return res.json({
            code: 200,
            success: true,
            message: '유저 삭제 성공'
        });
    } catch (err) {

        console.log(err);
        next(err);
    }
}



export const deletePost = async (req, res, next) => {

    const { postId } = req.params;

    try {
        await Post.findByIdAndDelete({
            _id: postId
        });


        return res.json({
            code: 200,
            success: true,
            message: '게시물 삭제 성공'
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
}



export const deleteHashtag = async (req, res, next) => {

    const { hashtagId } = req.params;

    try {

        await Hashtag.findByIdAndDelete(hashtagId);

        return res.json({
            code: 200,
            success: true,
            message: '해시태그 삭제 성공'
        });
    } catch (err) {

        console.log(err);
        next(err);
    }
}




export const update = async (req, res, next) => {
    try {
        const imgName = req.file.filename;
        await sharp(path.join(__dirname, '../../uploads', imgName), {
                failOnError: false
            })
            .metadata()
            .then(({
                    width
                }) => sharp(path.join(__dirname, '../../uploads', imgName), {
                    failOnError: false
                })
                .resize(Math.round(width * 0.7))
                .withMetadata()
                .toFile(path.join(__dirname, '../../uploads', '70resize' + imgName))
            );

        console.log(req.file);





        /*

                let posts=await Post.find().select('_id uploadedPhoto');

                for(let post of posts){
                    
                    let imgName=post.uploadedPhoto[0].split('/').pop();

                    if(imgName.substr(0,8)=="70resize") continue;
                
                    await sharp(path.join(__dirname,'../../uploads',imgName),{failOnError:false})
                    .metadata()
                    .then(({ width }) => sharp(path.join(__dirname,'../../uploads',imgName),{failOnError:false})
                    .resize(Math.round(width * 0.7))
                    .withMetadata()
                    .toFile(path.join(__dirname,'../../uploads','70resize'+imgName))
                    );

                    
                    await Post.findOneAndUpdate({
                        _id:post._id
                    },{
                        uploadedPhoto:[process.env.URL+'70resize'+imgName]
                    })          
                }
                */

        /*
                let users=await User.find().select('_id profileImgSrc');
                
                for(let user of users){


                    let imgName=user.profileImgSrc.split('/').pop();

                    if(imgName.substr(0,8)=="70resize") continue;

                   
                    await sharp(path.join(__dirname,'../../uploads',imgName),{failOnError:false})
                    .metadata()
                    .then(({ width }) => sharp(path.join(__dirname,'../../uploads',imgName),{failOnError:false})
                    .resize(Math.round(width * 0.7))
                    .withMetadata()
                    .toFile(path.join(__dirname,'../../uploads','70resize'+imgName))
                    );

                    
                    await User.findOneAndUpdate({
                        _id:user._id
                    },{
                        profileImgSrc:process.env.URL+'70resize'+imgName
                    })          
                }
                */


        return res.json({
            success: true
        });

    } catch (err) {

        console.log(err);
        next(err);
    }
}

export const update1 = async (req, res, next) => {
    try {
        return res.render('test.ejs');
    } catch (err) {

        console.log(err);
        next(err);
    }
}