const express = require('express')
const router = express.Router()
const user_handler = require('../router-handle/backuser')
const  expressJoi  = require('@escook/express-joi')
const {login_schema,reg_schema}= require('../schema/user')

router.post('/register',expressJoi(reg_schema),user_handler.regUser)

router.post('/login',expressJoi(login_schema),user_handler.login)


module.exports = router