import express from 'express';
import path from 'path';
import compression from 'compression';
import cors from 'cors';
import methodOverride from 'method-override';

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('uploads'));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(methodOverride());
app.use(cors());

app.use('/admin', adminRouter);
app.use('/auth', )

require('./src/routers/chatRouter')(app);
require('./src/routers/adminRouter')(app);
require('./src/routers/authRouter')(app);
require('./src/routers/profileRouter')(app);
require('./src/routers/postRouter')(app);
require('./src/routers/userRouter')(app);

app.get('/', (req, res) => {
    return res.send("hello developers");
});

app.use((err, req, res, next) => {
    if (!err.status) {
        return res.json({
            code: 500,
            success: false,
            message: '서버 에러'
        });
    }
});

export default app;