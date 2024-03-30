const db = require('../db/index')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config')
exports.regUser = (req, res) => {
    const userinfo = req.body;
    // console.log(userinfo);
    const sqlStr = 'select * from ev_back_users where username=?'
    //账号检验
    db.query(sqlStr, userinfo.username, (err, results) => {
        if (err) {
            return res.send({ status: 1, message: err.message })
        }
        if (results.length > 0) {
            return res.send({ status: 1, message: '用户名重复' })
        }
        //密码加密
        userinfo.password = bcrypt.hashSync(userinfo.password, 10)
        const sql = 'insert into ev_back_users set ?'
        db.query(sql, { username: userinfo.username, password: userinfo.password, permission: userinfo.role }, (err, results) => {
            if (err) {
                return res.send({ status: 1, message: err.message })
            }
            if (results.affectedRows !== 1) return res.send({ status: 1, message: '注册失败' })
            res.send({ status: 0, message: '注册成功' })
        })
    })


}
exports.login = (req, res) => {
    const userinfo = req.body;
    // console.log(userinfo);
    const sql = 'select * from ev_back_users where username=?'
    db.query(sql, userinfo.username, (err, results) => {
        if (err) {
            return res.send({ status: 1, message: err.message })
        }
        if (results.length !== 1) {
            return res.send({ status: 1, message: '用户不存在' })
        }
        const compare = bcrypt.compareSync(userinfo.password, results[0].password)
        if (!compare) {
            return res.send({ status: 1, message: '登录失败' })
        }
        const user = { ...results[0], password: '' }
        const tokenStr = jwt.sign(user, config.jwtSecretKey, { expiresIn: config.expiresIn })
        // console.log(tokenStr);
        res.send({
            status: 0,
            message: '登录成功',
            token: 'Bearer ' + tokenStr,
            permission: results[0].permission,
        })
    })

}