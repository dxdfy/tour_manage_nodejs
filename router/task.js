const express = require('express')

const router = express.Router()

const task_handler = require('../router-handle/task')

const expressJoi=require('@escook/express-joi')

const {add_task_schema, pass_schema, reject_schema} =require('../schema/task')

const { delete_schema } = require('../schema/task')

router.post('/add',expressJoi(add_task_schema),task_handler.addTask)

router.get('/cates',task_handler.getTaskCates)

router.get('/delete/:id', expressJoi(delete_schema),task_handler.deleteById)

router.post('/reject',expressJoi(reject_schema), task_handler.rejectById)

router.get('/pass/:id',expressJoi(pass_schema), task_handler.passById)

module.exports=router