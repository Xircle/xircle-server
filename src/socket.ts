import mongoose from 'mongoose';
import express from 'express';
import http from 'http';

const socket = (server:http.Server, app:express.Application) => {
   
    const io= require('socket.io')(server,{cors:{origin:"*"}},{ path: '/socket.io'});

    app.set('io', io);
    const room = io.of('/room');
    const chat = io.of('/chat');

    room.on('connection', (socket:any) => {
        console.log('room 네임스페이스에 접속');

        const req = socket.request;
        const { headers: { referer } } = req;
        let userId:string;

        if(referer&&referer.split('/')){
          userId = referer
          .split('/')[referer.split('/').length-2];
          socket.join(userId);
        }


        socket.on('disconnect', () => {
          console.log('room 네임스페이스 접속 해제');
          socket.leave(userId);
        });
    });

    chat.on('connection', (socket:any) => {
        console.log('chat 네임스페이스에 접속');

        const req = socket.request;
        const { headers: { referer } } = req;

        let roomId:string;

        if(referer&&referer.split('/')){
          roomId = referer
          .split('/')[referer.split('/').length-3];
          socket.join(roomId);
        }

        socket.on('disconnect', () => {
          console.log('chat 네임스페이스 접속 해제');
          socket.leave(roomId);
        });
    });


}

export default socket;