const express = require('express')

const router = express.Router()

const task_handler = require('../router-handle/task')

const expressJoi = require('@escook/express-joi')

const { pass_schema, reject_schema } = require('../schema/task')

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

router.post('/add', upload.single('file'), task_handler.add_update_Task)

router.post('/video', upload.single('file'), task_handler.add_video_Task)

router.post('/update_txt', task_handler.update_task_txt)

router.post('/remove', task_handler.remove_pics)

router.get('/cates', task_handler.getTaskCates)

router.get('/passcates', task_handler.getPassTaskCates)

router.post('/cates', task_handler.getTaskByUser)

router.post('/delete', task_handler.deleteByIdFore)

router.get('/delete/:id', expressJoi(delete_schema), task_handler.deleteById)

router.get('/delete/:id', expressJoi(delete_schema), task_handler.deleteById)

router.post('/reject', expressJoi(reject_schema), task_handler.rejectById)

router.get('/pass/:id', expressJoi(pass_schema), task_handler.passById)

router.post('/gettaskheight', task_handler.getTaskHeight)

router.post('/addcomment', task_handler.addComment)

router.get('/getcomments', task_handler.getComments)
module.exports = router