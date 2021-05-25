import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import sharp from 'sharp';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import {
    promisify
} from 'util';
import User from '../models/User';


export const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {
            cb(null, 'uploads/');
        },
        filename(req, file, cb) {
            cb(null, new Date().valueOf() + path.extname(file.originalname));
        }
    }),
    limits: {
        fileSize: 1024 * 1024 * 10
    },

})

export const resize = async (req, res, next) => {

    try {

        if (req.file) {

            const type = req.file.filename.split('.').pop();
            const types = ['jpg', 'jpeg', 'png', 'JPG', 'JPEG', 'PNG']
            const filepath = req.file.path;

            if (types.includes(type)) {
                await sharp(filepath, {
                        failOnError: false
                    })
                    .metadata()
                    .then(({
                            width
                        }) => sharp(filepath, {
                            failOnError: false
                        })
                        .resize(Math.round(width * 0.7))
                        .withMetadata()
                        .toFile(path.join('uploads', '7r' + req.file.filename)))
                    .then(global.gc);

                fs.unlinkSync(filepath);

                req.file.filename = '7r' + req.file.filename;
            }
        }
        next();
    } catch (err) {
        console.log(err);
        next(err);
    }

}

export const verify = async (req, res, next) => {

    const token = req.headers['access-token'];

    if (!token) {
        return res.json({
            success: false,
            code: 401,
            message: '로그인이 되어 있지 않습니다.'
        });
    }

    try {

        const verify = promisify(jwt.verify);
        const token = await verify(token, process.env.JWT_SECRET);

        const userId = await User.findOne({
            _id: token.id
        }).select('_id');

        if (userId) {
            req.id = mongoose.mongo.ObjectId(userId);
        } else {
            if (!user) {
                return res.json({
                    success: false,
                    code: 454,
                    message: '없는 유저아이디입니다'
                });
            }
        }

    } catch (err) {
        console.log(err);
        return res.json({
            success: false,
            code: 401,
            message: '검증실패'
        })
    }

};