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
exports.addTask = (req, res) => {
    const sql = 'select * from ev_tasks where name=? or xiangqing =?'
    console.log(req.body)
    db.query(sql, [req.body.name, req.body.xiangqing], (err, results) => {
        if (err) {
            return res.send({
                status: 1,
                message: err.message
            })
        }
        if (results.length === 2) return res.send({
            status: 1,
            message: '名称与详情重复'
        })
        if (results.length === 1 && results[0].name === req.body.name) return res.send({
            status: 1,
            message: '名称重复'
        })
        if (results.length === 1 && results[0].xiangqing === req.body.xiangqing) return res.send({
            status: 1,
            message: '详情重复'
        })
        const sql2 = `insert into ev_tasks set ?`
        db.query(sql2, req.body, (err, results) => {

            if (err) return res.send({
                status: 1,
                message: err.message
            })

            if (results.affectedRows !== 1) return res.send({
                status: 1,
                message: '新增任务失败'
            })

            res.send({
                status: 1,
                message: '新增任务成功'
            })
        })
    })

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
    console.log('id',Id);
    console.log('reason',reason);
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