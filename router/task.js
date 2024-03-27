const express = require('express')

const router = express.Router()

const task_handler = require('../router-handle/task')

const expressJoi=require('@escook/express-joi')

const { pass_schema, reject_schema} =require('../schema/task')

const { delete_schema } = require('../schema/task')

const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/upload')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})
const upload = multer({ storage: storage })

router.post('/add',upload.single('file'),task_handler.add_Task)

router.get('/cates',task_handler.getTaskCates)

router.get('/delete/:id', expressJoi(delete_schema),task_handler.deleteById)

router.post('/reject',expressJoi(reject_schema), task_handler.rejectById)

router.get('/pass/:id',expressJoi(pass_schema), task_handler.passById)

module.exports=router