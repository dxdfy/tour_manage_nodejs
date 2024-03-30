const db = require('../db/index')
const fs = require('fs')
const path = require('path')
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

// exports.getPassTaskCates = (req, res) => {
//     console.log('1')
//     const sql = 'select * from ev_tasks where status="已通过" and is_delete=0 order by id asc';
//     db.query(sql, async (err, tasksResults) => {
//         if (err) {
//             return res.send({
//                 status: 1,
//                 message: err.message
//             });
//         }

//         // 用于存储所有查询到的任务及对应的 avatar
//         const tasksWithAvatar = [];

//         // 对每个任务进行处理
//         for (const task of tasksResults) {
//             // 在 ev_users 表中查询对应的 avatar
//             const userSql = `SELECT avatar FROM ev_users WHERE name='${task.name}'`;
//             try {
//                 const userResults = await db.query(userSql);
//                 if (userResults.length > 0) {
//                     // 如果找到了对应的用户，则将 avatar 添加到任务信息中
//                     const taskWithAvatar = {
//                         ...task,
//                         avatar: userResults[0].avatar
//                     };
//                     tasksWithAvatar.push(taskWithAvatar);
//                 }
//             } catch (error) {
//                 console.error('查询用户信息失败：', error.message);
//             }
//         }

//         // 返回结果
//         res.send({
//             status: 0,
//             message: '获取任务成功',
//             data: tasksWithAvatar,
//         });
//     });
// };
const mysql = require('mysql2/promise');

exports.getPassTaskCates = async (req, res) => {
    console.log('1')
    const page = req.query.page; // Default page is 0
    const count = req.query.count; // Default count is 10
    console.log(page)
    console.log(count)
    try {
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: 'admin123',
            database: 'mydb1',
        });
        const offset = page * count;
        const sql = `select * from ev_tasks where status="已通过" and is_delete=0 order by id asc LIMIT ${offset}, ${count}`;
        const [tasksResults] = await connection.query(sql);
        // 用于存储所有查询到的任务及对应的 avatar
        const tasksWithAvatar = [];

        // 对每个任务进行处理
        for (const task of tasksResults) {
            // 在 ev_users 表中查询对应的 avatar
            const userSql = `SELECT avatar FROM ev_users WHERE username='${task.name}'`;
            const [userResults] = await connection.query(userSql);
            if (userResults.length > 0) {
                // 如果找到了对应的用户，则将 avatar 添加到任务信息中
                const taskWithAvatar = {
                    ...task,
                    avatar: userResults[0].avatar
                };
                tasksWithAvatar.push(taskWithAvatar);
            }
        }
        console.log(tasksWithAvatar)
        // 返回结果
        res.send({
            status: 0,
            message: '获取任务成功',
            data: tasksWithAvatar,
        });
    } catch (error) {
        console.error('查询数据库失败：', error.message);
        res.send({
            status: 1,
            message: '查询数据库失败',
        });
    }
};






exports.getTaskByUser = (req, res) => {
    const username = req.body.username;
    const sql = 'select * from ev_tasks where name = ? AND is_delete = 0'
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

exports.update_task_txt = (req, res) => {
    console.log('Received txt body:', req.body);
    const {
        id,
        text,
        title,
    } = req.body;

    console.log(id);
    console.log(text);
    console.log(title);
    const sqlSelect = 'SELECT * FROM ev_tasks WHERE id = ?';
    db.query(sqlSelect, id, (err, result) => {
        if (err) {
            return res.send({
                status: 1,
                message: err.message
            });
        } else {
            if (result.length > 0) {
                const sqlUpdate = 'UPDATE ev_tasks SET title= ?, text = ? WHERE id = ?';
                db.query(sqlUpdate, [title, text, id], (err, result) => {
                    if (err) {
                        return res.send({
                            status: 1,
                            message: err.message
                        });
                    }
                    return res.send({
                        status: 0,
                        message: '更新游记文本信息成功'
                    });

                });

            } else {
                return res.status(404).send('Data not found');
            }
        }
    });
}

exports.remove_pics = (req, res) => {
    console.log('Received remove body:', req.body);
    const {
        id,
        files,
    } = req.body;
    const filesArray = files.split(',');
    console.log('Received fileArray:', filesArray);
    const sqlSelect = 'SELECT * FROM ev_tasks WHERE id = ?';
    db.query(sqlSelect, id, (err, result) => {
        if (err) {
            return res.send({
                status: 1,
                message: err.message
            });
        } else {
            if (result.length > 0) {
                const {
                    pic_urls
                } = result[0];

                // 将 filesArray 中的 URL 从 pic_urls 中移除
                const updatedPicUrls = pic_urls.filter(url => !filesArray.includes(url));
                console.log('新的urls', updatedPicUrls);
                // 更新数据库中相应数据行的 pic_urls 字段
                const sqlUpdate = 'UPDATE ev_tasks SET pic_urls = ? WHERE id = ?';
                db.query(sqlUpdate, [JSON.stringify(updatedPicUrls), id], (err, result) => {
                    if (err) {
                        return res.send({
                            status: 1,
                            message: err.message
                        });
                    }
                    const filenames = filesArray.map(url => url.split('/').pop());
                    console.log('filenames', filenames);
                    filenames.forEach(filename => {
                        const filePath = path.join(__dirname, '..', 'public', 'upload', filename);
                        fs.unlink(filePath, err => {
                            if (err) {
                                console.error('Error deleting file:', err);
                                // Handle error, perhaps by sending an error response
                            } else {
                                console.log('File deleted successfully:', filePath);
                            }
                        });
                    });
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

exports.add_video_Task = (req, res) => {
    console.log('Received file:', req.file);
    console.log('Received body:', req.body);
    const title = req.body.titleValue;
    const username = req.body.username;
    const videoUrl = 'http://192.168.1.102:3007/public/upload/' + req.file.filename;
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
                // 如果存在相同标题和相同用户的记录，则更新
                const existingVideoUrls = [];
                existingVideoUrls.push(videoUrl);
                console.log('existingVideoUrls', existingVideoUrls);
                const sqlUpdate = 'UPDATE ev_tasks SET  video_urls = ? WHERE title = ? AND name = ?';
                db.query(sqlUpdate, [JSON.stringify(existingVideoUrls), title, username], (err, results) => {
                    if (err) {
                        return res.send({
                            status: 1,
                            message: err.message
                        });
                    }

                    return res.send({
                        status: 0,
                        message: '新增游记视频成功'
                    });
                });
            } else {
                return res.send({
                    status: 0,
                    message: '新增游记视频失败'
                });
            }
        });
    });
}

exports.add_update_Task = (req, res) => {
    console.log('Received file:', req.file);
    console.log('Received body:', req.body);

    const username = req.body.username;
    const title = req.body.titleValue;
    const text = req.body.textValue;
    const is_add = req.body.is_add;
    const avatarUrl = 'http://192.168.1.102:3007/public/upload/' + req.file.filename;
    if (is_add === 'true') {
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
                    // 如果存在相同标题和相同用户的记录,且不是第一次上传，而是编辑，则更新数据
                    if (is_add === 'true') {
                        return res.send({
                            status: 0,
                            message: '已有该标题的游记,请前往我的游记进行编辑'
                        });
                    } else {
                        const existingRecord = results[0];
                        const existingPicUrls = existingRecord.pic_urls || [];
                        existingPicUrls.push(avatarUrl);
                        console.log('existingPicUrls', existingPicUrls);
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

                    }

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
    } else {
        const id = req.body.id;
        const sqlSelect = 'SELECT * FROM ev_tasks WHERE id = ?';
        db.query(sqlSelect, id, (err, results) => {
            if (err) {
                return res.send({
                    status: 1,
                    message: err.message
                });
            }
            if (results.length > 0) {
                // 如果存在相同标题和相同用户的记录,且不是第一次上传，而是编辑，则更新数据
                const existingRecord = results[0];
                const existingPicUrls = existingRecord.pic_urls || [];
                existingPicUrls.push(avatarUrl);
                console.log('existingPicUrls', existingPicUrls);
                const sqlUpdate = 'UPDATE ev_tasks SET title= ?, text = ?, pic_urls = ? WHERE id = ?';
                db.query(sqlUpdate, [title, text, JSON.stringify(existingPicUrls), id], (err, results) => {
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
            }

        });
    }


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

exports.deleteByIdFore = (req, res) => {
    const id = req.body.id;
    const sql = `update ev_tasks set is_delete=1 where id=?`
    db.query(sql, id, (err, results) => {
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
    // console.log('id', Id);
    // console.log('reason', reason);
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

