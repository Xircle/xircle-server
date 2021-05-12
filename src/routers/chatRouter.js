module.exports = (app)=>{
    const chat = require('../controllers/chatController');
    const {verify}=require('../utils/middleware');

    //app.get('/chat',verify,chat.getChat);
    //app.post('/message',verify,createRoom);
}