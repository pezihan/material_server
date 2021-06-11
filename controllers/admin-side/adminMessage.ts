var AdmimUser = require('../../modules/AdminUser')
var { en } = require('../../util/tokenconfig')


const adminLogin = async (req: any, res: any) => {
    const { username, password } = req.body
    if (username == '' || username == undefined || password == '' || password == undefined) {
        res.send({data: {}, meta: { msg: 'Parameter error', status: 403 }})
        return
    }
    const result = await AdmimUser.getAdminUser(username, password)
    if (result === 500) {
        res.send({data: {}, meta: { msg: 'Server Error', status: 500 }})
        return
    } else if (result.length === 0) {
        res.send({data: {}, meta: { msg: '账号或密码错误', status: 403 }})
        return
    }
    // 生成token
    const token = en({id:result[0].id, time: new Date().getTime()})
    res.send({ data: { ...result[0], token: token }, meta: { msg: '登录成功', status: 200 }})
}

module.exports = {
    adminLogin
}