module.exports = (app)=>{
    const auth = require('../controllers/authController');
    const {upload,verify,resize}=require('../utils/middleware');

    
    app.post('/check/email',auth.checkEmail);
    app.post('/email',auth.sendEmail);
    app.post('/check/name',auth.checkName);
    app.post('/user',upload.single('profileImgSrc'),resize,auth.postUser);
    app.post('/login',auth.login);
    app.post('/find/info',auth.findInfo);




    
    
}