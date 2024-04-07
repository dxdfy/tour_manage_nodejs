const express = require('express')
const app = express()
const backuserRouter = require('./router/backuser.js')
const userinfoRouter = require('./router-handle/userinfo.js')
const taskRouter = require('./router/task')
const userRouter = require('./router/user.js')
const Joi = require('joi')
const config = require('./config')
const expressJWT = require('express-jwt')
const rateLimit = require('express-rate-limit');
const cors = require('cors')
// CORS配置
const corsOptions = {
    origin: '*', // 允许跨域请求的来源
    methods: ['GET', 'POST'], // 允许的HTTP方法
    allowedHeaders: ['Content-Type', 'Authorization'], // 允许的请求头
    credentials: true // 允许发送凭证（如cookies）
}
app.use(cors(corsOptions))
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1分钟
    max: 100, // 最大请求数量
    message: '请求过于频繁，请稍后再试。'
});
app.use(limiter);
app.use(expressJWT({ secret: config.jwtSecretKey }).unless({ path: [/^\/(api|back)/, /^\/public\//] }));
app.use(express.urlencoded({ extended: false }))
app.use('/public/', express.static('./public/'))
app.use('/back', backuserRouter)
app.use('/api', userRouter)
app.use('/my', userinfoRouter)
app.use('/my/task', taskRouter)
app.use((err, req, res, next) => {
    if (err instanceof Joi.ValidationError) {
        return res.send({ status: 1, message: err.message })
    }
    if (err.name === 'UnauthorizedError') {
        return res.send({ status: 1, message: '身份认证失败' })
    }
    res.send({ status: 1, message: err.message })
})

app.listen(3007, () => {
    console.log('run at http://192.168.1.103')
})

