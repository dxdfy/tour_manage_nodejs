const express = require('express')
const router = express.Router()
const user_handler = require('../router-handle/user')
const multer = require('multer');
const fs = require('fs');
// 设置文件上传的目录
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/upload')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})
const upload = multer({ storage: storage })
router.post('/login', user_handler.login)
router.post('/register', upload.single('file'), user_handler.register)
router.post('/update', upload.single('file'), user_handler.updateAvatar)
// router.post('/register', user_handler.register)
module.exports = router