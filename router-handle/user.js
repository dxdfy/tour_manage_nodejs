const db = require('../db/index')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config')
const fs = require('fs');
const { modifyUrlsInDatabase } = require('./task');


exports.login = (req, res) => {
    const userinfo = req.body
    // console.log(userinfo)
    const sql = 'select * from ev_users where `username`=?'
    db.query(sql, userinfo.username, (err, results) => {
        // console.log(results)
        if (err) return res.send({ status: 1, message: err.message })
        if (results.length !== 1) return res.send({ status: 1, message: '登录失败' })

        const compare = bcrypt.compareSync(userinfo.password, results[0].password)
        if (!compare) {
            return res.send({ status: 1, message: '登录失败！密码错误' })
        }
        // const user = { ...results[0], password: '', user_pic: '' }
        const user = { ...results[0], password: '', avatar: '' }
        const tokenStr = jwt.sign(user, config.jwtSecretKey, { expiresIn: config.expiresIn })
        // modifyUrlsInDatabase();
        // console.log('ok')
        res.send({
            status: 0,
            message: '登录成功',
            token: 'Bearer ' + tokenStr,
            username: results[0].username,
            avatar: results[0].avatar
        })

    })
}

// exports.register = (req, res) => {
//     const userinfo = req.body
//     const sqlStr = 'select * from ev_users where username=?'
//     db.query(sqlStr, userinfo.username, (err, results) => {
//         if (err) {
//             // return res.send({ status: 1, message: err.message })
//             return res.cc(err)
//         }
//         if (results.length > 0) {
//             // return res.send({ status: 1, message: '用户名被占用，请更换其它用户名！' })
//             return res.cc('用户名被占用，请更换其它用户名！')
//         }
//         const sql = 'insert into ev_users set ?'
//         db.query(sql, { username: userinfo.username, password: userinfo.password, avatar: userinfo.avatar }, (err, results) => {
//             if (err)
//                 // return res.send({ status: 1, message: err.message })
//                 return res.cc(err)
//             if (results.affectedRows !== 1)
//                 // return res.send({ status: 1, message: '注册用户失败，请稍后再试' })
//                 return res.cc('注册用户失败，请稍后再试')
//             // res.send({ status: 0, message: '注册成功！' })
//             res.cc('注册成功！', 0)
//         })
//     })
// }
exports.register = (req, res) => {
    // console.log('Received file:', req.file);
    // console.log('Received body:', req.body);
    const username = req.body.username;
    const password = req.body.password;
    const tempFilePath = req.file.path;
<<<<<<< HEAD
    const avatarUrl = 'http://192.168.1.105:3007/public/upload/' + req.file.filename;
=======
    const avatarUrl = 'http://192.168.1.108:3007/public/upload/' + req.file.filename;
>>>>>>> 63a5f47b51fcad22e01b2ea45adb0981b717ea3e
    // console.log('文件路径为', tempFilePath)

    // 将临时文件保存到指定目录
    const savedFilePath = './public/saved/' + req.file.filename;
    const readStream = fs.createReadStream(tempFilePath);
    const writeStream = fs.createWriteStream(savedFilePath);
    readStream.pipe(writeStream);

    // 创建MySQL查询
    const sqlStr = 'SELECT * FROM ev_users WHERE username = ?';

    // 查询数据库
    db.query(sqlStr, [username], function (err, result) {
        if (err) {
            console.error(err);
            res.status(500).send('Database error');
        } else {
            // 检查是否有匹配的openId
            if (result.length > 0) {
                return res.send({ status: 1, message: '用户名被占用，请更换其它用户名！' })
            } else {
                const secret_password = bcrypt.hashSync(password, 10);
                const sqlStr = `INSERT INTO ev_users (username,password, avatar) VALUES ('${username}','${secret_password}','${avatarUrl}')`;
                db.query(sqlStr, [username, secret_password, avatarUrl], (err, result) => {
                    if (err) throw err;
                    res.json({ status: 0, path: avatarUrl });
                });
                // console.log("插入新路径", avatarUrl);
            }
        }
    });
}

exports.updateAvatar = (req, res) => {
    console.log('updateavatar',req.body);
    const username = req.body.username;
    const avatarUrl = 'http://192.168.1.108:3007/public/upload/' + req.file.filename;

    // 将临时文件保存到指定目录
    const savedFilePath = './public/saved/' + req.file.filename;
    const readStream = fs.createReadStream(req.file.path);
    const writeStream = fs.createWriteStream(savedFilePath);
    readStream.pipe(writeStream);

    // 更新用户头像信息
    const sqlStr = 'UPDATE ev_users SET avatar = ? WHERE username = ?';

    db.query(sqlStr, [avatarUrl, username], function (err, result) {
        if (err) {
            console.error(err);
            res.status(500).send('Database error');
        } else {
            // 检查是否成功更新用户头像信息
            if (result.affectedRows > 0) {
                res.json({ status: 0, message: '头像更新成功', path: avatarUrl });
            } else {
                res.send({ status: 1, message: '更新头像失败，用户名不存在或者其他错误' });
            }
        }
    });
};
