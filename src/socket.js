const SocketIO = require('socket.io');
let mongoose = require('mongoose');

module.exports = (server, app) => {
   
    const io = SocketIO(server,{cors:{origin:"*"}},{ path: '/socket.io'});

    app.set('io', io);
    const room = io.of('/room');
    const chat = io.of('/chat');

    room.on('connection', (socket) => {
        console.log('room 네임스페이스에 접속');

        const req = socket.request;
        const { headers: { referer } } = req;

        if(referer&&referer.split('/')){
          const userId = referer
          .split('/')[referer.split('/').length-2];
          socket.join(userId);
        }


        socket.on('disconnect', () => {
          console.log('room 네임스페이스 접속 해제');
          socket.leave(userId);
        });
    });

    chat.on('connection', (socket) => {
        console.log('chat 네임스페이스에 접속');

        const req = socket.request;
        const { headers: { referer } } = req;
        
        if(referer&&referer.split('/')){
          const userId = referer
          .split('/')[referer.split('/').length-3];
          socket.join(userId);
        }

        socket.on('disconnect', () => {
          console.log('chat 네임스페이스 접속 해제');
          socket.leave(roomId);
        });
    });


}