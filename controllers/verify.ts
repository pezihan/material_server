var Token = require('../util/tokenconfig')
var UserDB = require('../modules/UserDB')

// 统一验证
module.exports = async function(req:any, res:any, next:any) {    
    // 用户ip地址
    let login_ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddres || req.socket.remoteAddress || '';
    if(login_ip.split(',').length>0){
        login_ip = login_ip.split(',')[0];
    }
    console.log(`${new Date().toLocaleString()} - 请求方式：${req.method} - 请求路径：${req.path} - IP地址：${login_ip}`);
    // 那些路径不需要token
    const path: Array<string> = ['/user/verify', '/user/sign', '/user/login','/user/resource','/user/holdlist','/user/classify']
    let index = -1
    for (let i = 0; i < path.length; i++) {
        index = req.path.search(path[i])
        if (index !== -1) break
    }
    if (index !== -1) {
        next() // 不用验证token的接口
    } else if (req.path.search('/user') !== -1) { // 用户端验证
        if (req.path.search('/user/search') !== -1 || req.path.search('/user/sort') !== -1 || req.path.search('/user/recommend') !== -1 
        || req.path.search('/user/usermaterial') !== -1 || req.path.search('user/userMsg') !== -1 ) {
            if (req.headers.authorization == undefined || req.headers.authorization == null || req.headers.authorization == '') {
                next()
                return
            }
        }
        // 验证token与是否被封号
        const token = req.headers.authorization 
        if (!token) {
            res.send({data: {}, meta: { msg: 'NO token', status: 403 }})
        }
        const userKey = Token.de(token)
        if (userKey.status === 'error') {
            res.send({data: {}, meta: { msg: 'token无效', status: 403 }})
        } 
        // else if (userKey.data.time + 43200000 < new Date().getTime()) {   // token 12小时过期
        //     res.send({data: {}, meta: { msg: 'token已过期,请重新登录', status: 403 }})
        // } 
        // 查询用户信息
        const result = await UserDB.getIdUserMsg(userKey.data.id)     
        if (result == 500) {
            res.send({data: {}, meta: { msg: '服务器错误', status: 500 }})
        } else if (result.length === 0) {
            res.send({data: {}, meta: { msg: '无此用户', status: 404 }})
        } else if (result[0].user_type == 1) {
            res.send({data: {}, meta: { msg: '账号违规已封号', status: 403 }})
        } else {
            req.userMsg = result[0]
            next()
        }
    } else if (req.path.search('/admin') !== -1) { // 管理员端验证
        res.send('管理员端验证')
    } else {
        next()
    }
  }

