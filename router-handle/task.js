const db = require('../db/index')
exports.getTaskCates = (req, res) => {
    const sql = 'select * from ev_tasks order by id asc'
    db.query(sql, (err, results) => {
        if (err) {
            return res.send({
                status: 1,
                message: err.message
            })
        }
        res.send({
            status: 0,
            message: '获取任务成功',
            data: results,
        })
    })
}

exports.getTaskByUser = (req, res) => {
    const username =req.body.username;
    const sql = 'select * from ev_tasks where name = ?'
    db.query(sql, username, (err, results) => {
        if (err) return res.send({
            status: 1,
            message: err.message
        })
        res.send({
            status: 0,
            message: '获取用户游记成功',
            data: results,
        })
    })
}

exports.remove_pics = (req,res) => {
    console.log('Received body:', req.body);
    const { username, title, files } = req.body;
    const filesArray = files.split(',');
    console.log('Received fileArray:', filesArray);
    const sqlSelect = 'SELECT * FROM ev_tasks WHERE title = ? AND name = ?';
    db.query(sqlSelect, [title, username], (err, result) => {
        if (err) {
            return res.send({
                status: 1,
                message: err.message
            });
        } else {
            if (result.length > 0) {
                const { pic_urls } = result[0];
                
                // 将 filesArray 中的 URL 从 pic_urls 中移除
                const updatedPicUrls = pic_urls.filter(url => !filesArray.includes(url));
                console.log('新的urls',updatedPicUrls);
                // 更新数据库中相应数据行的 pic_urls 字段
                const sqlUpdate = 'UPDATE ev_tasks SET pic_urls = ? WHERE title = ? AND name = ?';
                db.query(sqlUpdate, [JSON.stringify(updatedPicUrls), title, username], (err, result) => {
                    if (err) {
                        return res.send({
                            status: 1,
                            message: err.message
                        });
                    }

                    return res.send({
                        status: 0,
                        message: '删除游记图片成功'
                    });
                    
                });
            } else {
                res.status(404).send('Data not found');
            }
        }
    });
}

exports.add_Task = (req, res) => {
    console.log('Received file:', req.file);
    console.log('Received body:', req.body);

    const username = req.body.username;
    const title = req.body.titleValue;
    const text = req.body.textValue;
    const avatarUrl = 'http://192.168.1.107/public/upload/' + req.file.filename;


    const sqlSelect = 'SELECT * FROM ev_tasks WHERE title = ? AND name != ?';
    db.query(sqlSelect, [title, username], (err, results) => {
        if (err) {
            return res.send({
                status: 1,
                message: err.message
            });
        }

        if (results.length > 0) {
            return res.send({
                status: 1,
                message: '游记重名'
            });
        }

        // 检查是否存在相同标题和相同用户的记录
        const sqlCheckExist = 'SELECT * FROM ev_tasks WHERE title = ? AND name = ?';
        db.query(sqlCheckExist, [title, username], (err, results) => {
            if (err) {
                return res.send({
                    status: 1,
                    message: err.message
                });
            }

            if (results.length > 0) {
                // 如果存在相同标题和相同用户的记录，则更新数据
                const existingRecord = results[0];
                const existingPicUrls = existingRecord.pic_urls || [];
                existingPicUrls.push(avatarUrl);
                console.log('existingPicUrls',existingPicUrls);
                const sqlUpdate = 'UPDATE ev_tasks SET text = ?, pic_urls = ? WHERE title = ? AND name = ?';
                db.query(sqlUpdate, [text, JSON.stringify(existingPicUrls), title, username], (err, results) => {
                    if (err) {
                        return res.send({
                            status: 1,
                            message: err.message
                        });
                    }

                    return res.send({
                        status: 0,
                        message: '更新游记成功'
                    });
                });
            } else {
                // 如果不存在相同标题和相同用户的记录，则插入数据
                const newPicUrls = [avatarUrl];

                const sqlInsert = 'INSERT INTO ev_tasks (name, title, text, pic_urls) VALUES (?, ?, ?, ?)';
                db.query(sqlInsert, [username, title, text, JSON.stringify(newPicUrls)], (err, results) => {
                    if (err) {
                        return res.send({
                            status: 1,
                            message: err.message
                        });
                    }

                    return res.send({
                        status: 0,
                        message: '新增游记成功'
                    });
                });
            }
        });
    });

}

exports.deleteById = (req, res) => {
    const sql = `update ev_tasks set is_delete=1 where id=?`
    db.query(sql, req.params.id, (err, results) => {
        if (err) return res.send({
            status: 1,
            message: err.message
        })
        res.send({
            status: 0,
            message: '删除成功'
        })
    })
}

exports.passById = (req, res) => {
    const sql = `update ev_tasks set status ='已通过' where id=?`
    db.query(sql, req.params.id, (err, results) => {
        if (err) return res.send({
            status: 1,
            message: err.message
        })
        res.send({
            status: 0,
            message: '审核通过'
        })
    })
}

exports.rejectById = (req, res) => {
    const {
        Id,
        reason
    } = req.body;
    console.log('id', Id);
    console.log('reason', reason);
    const sql = `UPDATE ev_tasks SET status = '已拒绝', rejection_reason = ? WHERE Id = ?`;
    db.query(sql, [reason, Id], (err, results) => {
        if (err) {
            return res.send({
                status: 1,
                message: err.message
            });
        }
        res.send({
            status: 0,
            message: '拒绝成功'
        });
    });

}
