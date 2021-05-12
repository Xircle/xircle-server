module.exports = (app)=>{
    const user = require('../controllers/userController');
    const {upload,verify}=require('../utils/middleware');

    //app.patch('/user/:userId/follow',verify,user.follow);
    app.get('/users',verify,user.getUsers);
}