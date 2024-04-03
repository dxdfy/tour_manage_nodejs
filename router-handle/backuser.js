const db = require('../db/index')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config')
const joi = require('joi')
exports.regUser = (req, res) => {
    const userinfo = req.body;
    // console.log(userinfo);
    const sqlStr = 'select * from ev_back_users where username=?'
    //账号检验
    db.query(sqlStr, userinfo.username, (err, results) => {
        if (err) {
            return res.send({
                status: 1,
                message: err.message
            })
        }
        if (results.length > 0) {
            return res.send({
                status: 1,
                message: '用户名重复'
            })
        }
        //密码加密
        userinfo.password = bcrypt.hashSync(userinfo.password, 10)
        const sql = 'insert into ev_back_users set ?'
        db.query(sql, {
            username: userinfo.username,
            password: userinfo.password,
            permission: userinfo.role
        }, (err, results) => {
            if (err) {
                return res.send({
                    status: 1,
                    message: err.message
                })
            }
            if (results.affectedRows !== 1) return res.send({
                status: 1,
                message: '注册失败'
            })
            res.send({
                status: 0,
                message: '注册成功'
            })
        })
    })


}
exports.login = (req, res) => {
    const userinfo = req.body;
    // console.log(userinfo);
    const sql = 'select * from ev_back_users where username=?'
    db.query(sql, userinfo.username, (err, results) => {
        if (err) {
            return res.send({
                status: 1,
                message: err.message
            })
        }
        if (results.length !== 1) {
            return res.send({
                status: 1,
                message: '用户不存在'
            })
        }
        const compare = bcrypt.compareSync(userinfo.password, results[0].password)
        if (!compare) {
            return res.send({
                status: 1,
                message: '登录失败'
            })
        }
        const user = {
            ...results[0],
            password: ''
        }
        const tokenStr = jwt.sign(user, config.jwtSecretKey, {
            expiresIn: config.expiresIn
        })
        // console.log(tokenStr);
        res.send({
            status: 0,
            message: '登录成功',
            token: 'Bearer ' + tokenStr,
            permission: results[0].permission,
        })
    })

}

exports.getAuditors = (req, res) => {
    const sql = 'select * from ev_back_users where permission=?';
    db.query(sql, 'audit', (err, results) => {
        if (err) {
            return res.send({
                status: 1,
                message: err.message
            });
        }
        res.send({
            status: 0,
            data: results
        });
    });
}

exports.updateUserPermission = (req, res) => {
    const {
        id,
        username,
        permission
    } = req.body;
    console.log(req.body);
    let role = 'manage';
    if (permission === '审核人员') {
        role = 'audit';
    }
    // Check if the user exists and has permission 'audit'
    const sqlCheckUser = 'SELECT * FROM ev_back_users WHERE id = ?  AND permission = ?';
    db.query(sqlCheckUser, [id, 'audit'], (err, results) => {
        if (err) {
            return res.send({
                status: 1,
                message: err.message
            });
        }
        if (results.length !== 1) {
            return res.send({
                status: 1,
                message: '用户不存在或无权限修改'
            });
        }
        const sqlCheckUsername = 'SELECT * FROM ev_back_users WHERE username = ? AND id != ?';
        db.query(sqlCheckUsername, [username, id], (err, usernameResults) => {
            if (err) {
                return res.send({
                    status: 1,
                    message: err.message
                });
            }
            if (usernameResults.length > 0) {
                return res.send({
                    status: 1,
                    message: '该用户名已存在'
                });
            }

            // Update user permission
            const sqlUpdatePermission = 'UPDATE ev_back_users SET permission = ? , username = ? WHERE id = ?';
            db.query(sqlUpdatePermission, [role, username, id], (err, updateResult) => {
                if (err) {
                    return res.send({
                        status: 1,
                        message: err.message
                    });
                }
                if (updateResult.affectedRows !== 1) {
                    return res.send({
                        status: 1,
                        message: '更新失败'
                    });
                }
                res.send({
                    status: 0,
                    message: '用户更新成功'
                });
            });
        });
    });
};

exports.updatePassword = (req, res) => {
    const {
        id,
        password
    } = req.body;

    // Check if the user exists
    const sqlCheckUser = 'SELECT * FROM ev_back_users WHERE id = ?';
    db.query(sqlCheckUser, [id], (err, results) => {
        if (err) {
            return res.send({
                status: 1,
                message: err.message
            });
        }
        if (results.length !== 1) {
            return res.send({
                status: 1,
                message: '用户不存在'
            });
        }

        // Update user password
        const hashedPassword = bcrypt.hashSync(password, 10);
        const sqlUpdatePassword = 'UPDATE ev_back_users SET password = ? WHERE id = ?';
        db.query(sqlUpdatePassword, [hashedPassword, id], (err, updateResult) => {
            if (err) {
                return res.send({
                    status: 1,
                    message: err.message
                });
            }
            if (updateResult.affectedRows !== 1) {
                return res.send({
                    status: 1,
                    message: '密码更新失败'
                });
            }
            res.send({
                status: 0,
                message: '密码更新成功'
            });
        });
    });
}

exports.deleteById = (req, res) => {
    const { id } = req.body; // 获取请求体中的 ID 参数

    // 使用 Joi 验证 ID
    const { error } = joi.string().pattern(/^\d+$/).validate(id);
    if (error) {
        return res.status(400).json({ status: 1, message: '无效的 ID' });
    }
    // 执行删除操作
    const sqlDeleteUser = 'DELETE FROM ev_back_users WHERE id = ?';
    db.query(sqlDeleteUser, [id], (err, results) => {
        if (err) {
            return res.send({ status: 1, message: err.message });
        }
        if (results.affectedRows !== 1) {
            return res.send({ status: 1, message: '未找到相应的用户' });
        }
        res.send({ status: 0, message: '用户删除成功' });
    });

}