const express = require('express')
const router = express.Router()
const user_handler = require('../router-handle/user')
const  expressJoi  = require('@escook/express-joi')
const {reg_login_schema}= require('../schema/user')

router.post('/register',expressJoi(reg_login_schema),user_handler.regUser)

router.post('/login',user_handler.login)
// expressJoi(reg_login_schema),

module.exports = router