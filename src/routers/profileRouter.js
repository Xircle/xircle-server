module.exports = (app)=>{
    const profile = require('../controllers/profileController');
    const {upload,verify,resize,pager}=require('../utils/middleware');

   

    app.get('/user/:userId/profile',verify,profile.getProfile);


    app.get('/user/:userId/profile/post',verify,pager,profile.getPost);

    app.put('/user/profile',upload.single('profileImgSrc'),resize,verify,profile.updateProfile);
}