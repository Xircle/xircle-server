module.exports = (app)=>{
    const admin = require('../controllers/adminController');
    const {upload,resize,verify}=require('../utils/middleware');

    app.get('/chat/user/:userId/room',admin.getChatRoom);
    app.post('/register',admin.register);
    app.post('/message',verify,admin.createMessage);

    app.get('/room/:userId',verify,admin.getRoom);
    app.get('/chat/:userId/:roomId',verify,admin.getChat);

    app.get('/test',admin.test);
}