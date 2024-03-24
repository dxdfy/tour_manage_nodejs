const express = require('express')
const app=express()
const userRouter =require('./router/router.js')
const userinfoRouter = require('./router-handle/userinfo.js')
const taskRouter = require('./router/task')
const Joi = require('joi')
const config = require('./config')
const expressJWT = require('express-jwt')
const cors =require('cors')
// CORS配置
const corsOptions = {
    origin: 'http://localhost:5173', // 允许跨域请求的来源
    methods: ['GET', 'POST'], // 允许的HTTP方法
    allowedHeaders: ['Content-Type', 'Authorization'], // 允许的请求头
    credentials: true // 允许发送凭证（如cookies）
}
app.use(cors(corsOptions))
app.use(expressJWT({secret:config.jwtSecretKey}).unless({path:[/^\/api/]}))
app.use(express.urlencoded({extended:false}))
app.use('/api',userRouter)
app.use('/my',userinfoRouter)
app.use('/my/task',taskRouter)
app.use((err,req,res,next)=>{
    if(err instanceof Joi.ValidationError) {
       return res.send({status:1,message:err.message})
    }
    if(err.name === 'UnauthorizedError') {
        return res.send({status:1,message:'身份认证失败'})
    }
    res.send({status:1,message:err.message})
})

app.listen(3007,()=>{
    console.log('run at http://127.0.0.1')
})

