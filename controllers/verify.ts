var Token = require('../util/tokenconfig')
var UserDB = require('../modules/UserDB')
var AdminUser = require('../modules/AdminUser')

// 统一验证
module.exports = async function(req:any, res:any, next:any) {    
    // 用户ip地址
    let login_ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddres || req.socket.remoteAddress || '';
    if(login_ip.split(',').length>0){
        login_ip = login_ip.split(',')[0];
    }
    console.log(`${new Date().toLocaleString()} - request method：${req.method} - Request path：${req.path} - IP address ：${login_ip}`);
    // 那些路径不需要token 
    const path: Array<string> = ['/public', '/node_modules', '/user/hotSearch','/user/verify', '/user/sign', '/user/login','/user/resource','/user/holdlist','/user/classify', '/user/similarity', '/user/getComment', '/admin/login']
    let index = -1
    for (let i = 0; i < path.length; i++) {
        index = req.path.search(path[i])
        if (index !== -1) break
    }
    if (index !== -1) {
        next() // 不用验证token的接口
    } else if (req.path.search('/user/') !== -1) { // 用户端验证
        if (req.path.search('/user/search') !== -1 || req.path.search('/user/sort') !== -1 || req.path.search('/user/recommend') !== -1
        || req.path.search('/user/usermaterial') !== -1 || req.path.search('user/userMsg') !== -1 || req.path.search('user/particulars') !== -1) {
            if (req.headers.authorization == undefined || req.headers.authorization == null || req.headers.authorization == '' || req.headers.authorization == 'null') {
                next()
                return
            }
        }
        // 验证token与是否被封号
        const token = req.headers.authorization
        if (!token) {
            res.send({data: {}, meta: { msg: 'NO token', status: 401 }})
            return
        }
        const userKey = Token.de(token)
        if (userKey.status === 'error') {
            res.send({data: {}, meta: { msg: 'token无效', status: 401 }})
            return
        } 
        else if (userKey.data.time + 43200000 < new Date().getTime()) {   // token 12小时过期
            res.send({data: {}, meta: { msg: 'token已过期,请重新登录', status: 401 }})
            return
        } 
        // 查询用户信息
        const result = await UserDB.getIdUserMsg(userKey.data.id)     
        if (result == 500) {
            res.send({data: {}, meta: { msg: '服务器错误', status: 500 }})
            return
        } else if (result.length === 0) {
            res.send({data: {}, meta: { msg: '无此用户', status: 404 }})
            return
        } else if (result[0].user_type == 1) {
            res.send({data: {}, meta: { msg: '账号违规已封号', status: 401 }})
            return
        } else {
            req.userMsg = result[0]
            next()
        }
    } else if (req.path.search('/admin/') !== -1) { // 管理员端验证
        // 验证token
        const token = req.headers.authorization 
        if (!token) {
            res.send({data: {}, meta: { msg: 'NO token', status: 403 }})
            return
        }
        const userKey = Token.de(token)
        if (userKey.status === 'error') {
            res.send({data: {}, meta: { msg: 'token无效', status: 403 }})
            return
        } 
        else if (userKey.data.time + 43200000 < new Date().getTime()) {   // token 12小时过期
            res.send({data: {}, meta: { msg: 'token已过期,请重新登录', status: 403 }})
            return
        }
        // 查询用户是否存在
        const adminUserMsg = await AdminUser.getIdAdminUser(userKey.data.id)
        if (adminUserMsg == 500) {
            res.send({data: {}, meta: { msg: '服务器错误', status: 500 }})
            return
        } else if (adminUserMsg.length === 0) {
            res.send({data: {}, meta: { msg: '无此用户', status: 404 }})
            return
        }
        if (req.path.search('/admin/allAdminUser') !== -1 || req.path.search('/admin/addAdminUser') !== -1 || req.path.search('/admin/setAdminStatus') !== -1
        || req.path.search('/admin/editAdmin') !== -1 || req.path.search('/admin/delAdmin') !== -1) {
            if (adminUserMsg[0].status == 1) {
                res.send({data: {}, meta: { msg: '账号不是管理员账号', status: 403 }})
                return
            }
            next()
        } else {
            next()
        }
    } else {
        next()
    }
  }

