const db = require('../db/index')
const fs = require('fs')
const path = require('path')
const sharp = require('sharp');
const bcrypt = require('bcryptjs')
const config = require('../config');
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
    // console.log('1')
    const page = req.query.page; // Default page is 0
    const count = req.query.count; // Default count is 10
    // console.log(page)
    // console.log(count)
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
        // const [tasksResults] = await db.query(sql);
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
        // console.log(tasksWithAvatar)
        connection.end();
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




exports.getPassTaskByTaskId = (req, res) => {
    const id = req.body.id;
    const sql = 'select * from ev_tasks where id = ? AND is_delete = 0'
    db.query(sql, id, (err, results) => {
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

exports.getPassTaskByUser = (req, res) => {
    const username = req.body.username;
    const sql = 'select * from ev_tasks where name = ? AND status = "已通过" AND is_delete = 0 '
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
    // console.log('Received txt body:', req.body);
    const {
        id,
        text,
        title,
    } = req.body;

    // console.log(id);
    // console.log(text);
    // console.log(title);
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
    // console.log('Received remove body:', req.body);
    const {
        id,
        files,
    } = req.body;
    const filesArray = files.split(',');
    // console.log('Received fileArray:', filesArray);
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
    const videoUrl = config.baseUrl + req.file.filename;
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
                const existingTask = results[0];
                const existingVideoUrls = [];
                existingVideoUrls.push(videoUrl);
                console.log('existingTask', existingTask);
                const sqlUpdate = 'UPDATE ev_tasks SET  video_urls = ? WHERE title = ? AND name = ?';
                db.query(sqlUpdate, [JSON.stringify(existingVideoUrls), title, username], (err, results) => {
                    if (err) {
                        return res.send({
                            status: 1,
                            message: err.message
                        });
                    }
                    const oldVideoUrls = existingTask.video_urls || '[]';
                    const oldVideoUrl = oldVideoUrls[0]; // 假设只有一个旧视频文件
                    console.log('oldVideoUrl', oldVideoUrl);
                    if (oldVideoUrls.length === 1) {
                        const filename = oldVideoUrl.split('/').pop();
                        const filePath = path.join(__dirname, '..', 'public', 'upload', filename);
                        fs.unlink(filePath, err => {
                            if (err) {
                                console.error('Error deleting file:', err);
                                // 可能需要处理删除失败的情况
                            } else {
                                console.log('Old video deleted successfully:', filePath);
                            }
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

exports.deleteVideo = (req, res) => {
    console.log('Received 删除视频', req.body);
    const id = req.body.id;
    const sql = `update ev_tasks set video_urls = ? where id=?`
    const existingVideoUrls = [];
    db.query(sql, [JSON.stringify(existingVideoUrls), id], (err, results) => {
        if (err) return res.send({
            status: 1,
            message: err.message
        })
        res.send({
            status: 0,
            message: '删除视频成功'
        })
    })

}

exports.add_update_Task = (req, res) => {
    console.log('Received file:', req.file);
    console.log('Received body:', req.body);

    const username = req.body.username;
    const title = req.body.titleValue;
    const text = req.body.textValue;
    const is_add = req.body.is_add;
    const avatarUrl = config.baseUrl + req.file.filename;
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
                    {
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
// exports.getTaskHeight = (req, res) => async (req, res) => {
//     try {
//         console.log('1')
//         const queryheightlist = req.query.queryheightlist;
//         console.log(queryheightlist)
//         // 定义用于存储高度的数组
//         const heightlist = [];

//         // 并行处理每个图片链接，获取高度
//         await Promise.all(queryheightlist.map(async (url) => {
//             // 将URL中的反斜杠替换为斜杠
//             const newstr = url.replace(/\\/g, '/');

//             // 使用sharp获取图片信息
//             const metadata = await sharp(newstr).metadata();

//             // 获取图片高度
//             const imageHeight = metadata.height;

//             // 将高度添加到数组中
//             heightlist.push(imageHeight);
//         }));

//         // 返回高度列表
//         res.json(heightlist);
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Error processing images');
//     }
// };
exports.getTaskHeight = async (req, res) => {
    // console.log(req.body)
    try {
        const queryheightlist = JSON.parse(req.body.data);
        // console.log(queryheightlist)
        // 定义用于存储高度的数组
        const heightlist = [];

        // 循环处理每个图片链接
        // for (const url of queryheightlist) {
        for (let i = 0; i < queryheightlist.length; i++) {
            // 将URL中的反斜杠替换为斜杠
            const newstr = queryheightlist[i].replace(/\\/g, '/');
            // 使用sharp获取图片信息
            await sharp(newstr)
                .metadata()
                .then(metadata => {

                    const imageHeight = metadata.height;
                    const imageWidth = metadata.width;
                    // console.log(newstr)
                    // console.log(imageHeight)
                    // console.log(imageWidth)
                    const height = imageHeight / imageWidth * 150 + 90;
                    // 将图片高度添加到数组中
                    heightlist.push(height);
                    // 判断是否所有图片高度都已获取，如果是则返回数组
                    if (heightlist.length === queryheightlist.length) {
                        // console.log(heightlist)
                        res.json(heightlist);
                    }
                })
                .catch(err => {
                    console.error(err);
                    res.status(500).send('Error processing image');
                });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error processing images');
    }
};

exports.addComment = async (req, res) => {
    // const connection = await mysql.createConnection({
    //     host: '127.0.0.1',
    //     user: 'root',
    //     password: 'admin123',
    //     database: 'my_db_01',
    // });

    console.log(req.body)
    const id = req.body.id;
    const comment = JSON.parse(req.body.comment);
    console.log(id)
    console.log(comment)

    const sql = 'select * from ev_tasks where id = ?';
    db.query(sql, [id], (error, results) => {
        if (error) {
            console.error('Error updating comment:', error);
            res.send({
                status: 1,
                message: error
            })
            return;
        }
        console.log('result', results[0])
        // 获取原始评论数组
        const originalComments = results[0].comments !== null ? results[0].comments : [];

        // 添加新评论
        originalComments.push(comment);

        // 将数组转换回 JSON 字符串
        const updatedCommentsJSON = JSON.stringify(originalComments);

        // 更新数据库中的 comments 字段
        const updateSQL = 'update ev_tasks set comments = ? where id = ?';
        db.query(updateSQL, [updatedCommentsJSON, id], (updateError, updateResults) => {
            if (updateError) {
                console.error('Error updating comments:', updateError);
                res.send({
                    status: 1,
                    message: updateError
                })
                return;
            }
            console.log('Comments updated successfully.');
            res.send({
                status: 0,
                message: 'success'
            })
        });
    });

}
exports.getComments = (req, res) => {
    const id = req.query.id; // 假设通过路由参数获取id
    // 查询数据库
    const sql = 'SELECT comments FROM ev_tasks WHERE id = ?';
    db.query(sql, id, (error, results) => {
        if (error) {
            console.error('Error fetching comments:', error);
            res.status(500).json({
                status: 1,
                message: 'Internal Server Error'
            });
            return;
        }

        // 如果找到了记录
        if (results.length === 1) {
            console.log(results[0].comments)
            const comments = results[0].comments; // 解析JSON字段
            res.status(200).json({
                status: 0,
                data: comments
            });
        } else {
            res.status(404).json({
                status: 1,
                message: 'Comments not found'
            });
        }
    });
}
const replaceUrls = (urls) => {
    return urls.map(url => url.replace(/http:\/\/[^:]*:3007\//, config.baseApi));
};

exports.modifyUrlsInDatabase = () => {
    const sqlSelect = 'SELECT * FROM ev_tasks';
    db.query(sqlSelect, (err, results) => {
        if (err) {
            console.error('Error selecting data from database:', err);
            return;
        }
        if (results.length === 0) {
            console.log('No data found in the database.');
            return;
        }
        results.forEach(task => {
            const taskId = task.id;
            const comments = task.comments || null;
            if(comments !==null){
                const updatedComments = comments.map(comment => {
                    if (comment.avatar) {
                        comment.avatar = comment.avatar.replace(/http:\/\/[^:]*:3007\//, config.baseApi);
                    }
                    return comment;
                });
    
                const sqlUpdateComments = 'UPDATE ev_tasks SET comments = ? WHERE id = ?';
                db.query(sqlUpdateComments, [JSON.stringify(updatedComments), taskId], (err, results) => {
                    if (err) {
                        console.error('在 ev_tasks 表中更新评论时出错：', err);
                    } else {
                        console.log('ID 为', taskId, '的任务评论已成功更新。');
                    }
                });
            }
        });
        // 对每条记录进行处理
        results.forEach(task => {
            const id = task.id;
            const picUrls = task.pic_urls || [];
            const videoUrls = task.video_urls || [];

            // 替换 pic_urls 中的 URL
            const replacedPicUrls = replaceUrls(picUrls);
            // 替换 video_urls 中的 URL
            const replacedVideoUrls = replaceUrls(videoUrls);

            // 更新数据库中的记录
            const sqlUpdate = 'UPDATE ev_tasks SET pic_urls = ?, video_urls = ? WHERE id = ?';
            db.query(sqlUpdate, [JSON.stringify(replacedPicUrls), JSON.stringify(replacedVideoUrls), id], (err, results) => {
                if (err) {
                    console.error('Error updating data in database:', err);
                } else {
                    console.log('Data updated successfully for task with ID:', id);
                }
            });
        });
    });
    const sqlSelect2 = 'SELECT * FROM ev_users';
    db.query(sqlSelect2, (err, results) => {
        if (err) {
            console.error('Error selecting data from database:', err);
            return;
        }
        if (results.length === 0) {
            console.log('No data found in the database.');
            return;
        }

        // 对每条记录进行处理
        results.forEach(user => {
            const username = user.username;
            const avatar = user.avatar; // Assuming avatar field exists in user
            if (avatar !== null) {
                const replacedAvatar = avatar.replace(/http:\/\/[^:]*:3007\//, config.baseApi);

                // 更新数据库中的记录
                const sqlUpdateUser = 'UPDATE ev_users SET avatar = ? WHERE username = ?';
                db.query(sqlUpdateUser, [replacedAvatar, username], (err, results) => {
                    if (err) {
                        console.error('Error updating avatar in database:', err);
                    } else {
                        console.log('Avatar updated successfully for user with username:', username);
                    }
                });
            }
        });
    });
};

exports.update_password = (req, res) => {
    console.log('password', req.body);
    const username = req.body.username;
    const password = req.body.password;
    const sqlStr = 'SELECT * FROM ev_users WHERE username = ?';
    // 查询数据库
    db.query(sqlStr, [username], function (err, result) {
        if (err) {
            console.error(err);
            res.status(500).send('Database error');
        } else {
            // 检查是否有匹配的openId
            if (result.length === 0) {
                return res.send({
                    status: 1,
                    message: '用户名不存在，出错！'
                })
            } else {
                const secret_password = bcrypt.hashSync(password, 10);
                const updatePasswordSql = 'UPDATE ev_users SET password = ? WHERE username = ?';
                db.query(updatePasswordSql, [secret_password, username], (err, result) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Database error');
                    }
                    return res.send({
                        status: 0,
                        message: '密码更新成功'
                    });
                });
            }
        }
    });
}
exports.getMyComments = (req, res) => {
    const username = req.body.username;
    const sqlStr = 'SELECT comments FROM ev_tasks WHERE JSON_CONTAINS(comments, ? , "$")';

    // 查询数据库
    db.query(sqlStr, [`{"username": "${username}"}`], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }

        // 返回查询结果
        res.json(results);
    });
};

exports.getCommentsToMe = (req, res) => {
    const username = req.body.username;
    const sqlQuery = 'SELECT id, comments FROM ev_tasks WHERE name = ? AND is_delete = 0';

    // 查询数据库
    db.query(sqlQuery, [username], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                error: 'Database error'
            });
        }

        // 存储所有评论的数组
        let allComments = [];

        // 遍历结果，提取评论和行 ID
        results.forEach(row => {
            const id = row.id;
            const comments = row.comments;
            // console.log('id',id);
            // console.log('comments',row.comments);
            if (comments && Array.isArray(comments)) {
                // 如果该行有评论，则将其添加到 allComments 数组中
                const commentsWithId = comments.map(comment => ({
                    id,
                    ...comment
                })); // 添加行 ID 到每条评论
                allComments = allComments.concat(commentsWithId);
            }
        });

        // 返回所有评论
        console.log('allcomments', allComments);
        res.json(allComments);
    });
};