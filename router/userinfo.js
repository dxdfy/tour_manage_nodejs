const db =require('../db/index')
exports.getUserInfo = (req,res)=>{
    const sql = 'select id,username,nickname,email from ev_users where id=?'
    db.query(sql ,req.user.id,(err,results)=>{
        if(err){
            return res.send({status:1,message:err.message})
        }
        if(results.length!== 1){
            return res.send({status:1,message:'用户信息获取失败'})
        }
        res.send({
            status:0,
            message:'获取用户信息成功',
            data:results[0],
        })
    })
}