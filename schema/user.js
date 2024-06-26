const joi = require('joi')
//用户名由字母和数字组成的字符串，长度在 1 到 10 个字符
const username = joi.string().alphanum().min(1).max(10).required()
//密码密码是一个长度在 6 到 12 个字符之间的字符串，且不包含空格
const password = joi.string().pattern(/^[\S]{6,12}$/).required()
//用户id
const id=joi.string().pattern(/^\d+$/).required()
const role = joi.string().valid('audit', 'manage').required()
exports.login_schema = {
    body: {
        username,
        password,
    },
}
exports.reg_schema = {
    body: {
        username,
        password,
        role,
    },
}
exports.update_schema = {
    body: {
        id,
        password,
    },
}