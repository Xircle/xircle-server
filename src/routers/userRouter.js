module.exports = (app)=>{
    const user = require('../controllers/userController');
    const {verify,pager}=require('../utils/middleware');

    //app.patch('/user/:userId/follow',verify,user.follow);
    app.get('/users',verify,pager,user.getUsers);
}