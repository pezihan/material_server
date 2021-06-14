var AdmimUser = require('../../modules/AdminUser')
var { en } = require('../../util/tokenconfig')

// 登录
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

// 获取所有的管理员
const allAdminUser = async (req: any, res: any) => {
    const { query, start, limit } = req.query
    if (start == '' || start == undefined || start < 1 || limit == '' || limit == undefined || limit < 1) {
        res.send({data: {}, meta: { msg: '请求参数错误', status: 403 }})
        return
    }
    // 获取用户信息
    const userAdmin = await AdmimUser.queryAdminUser(start, limit, query)
    if (userAdmin == 500) {
        res.send({data: {}, meta: { msg: 'Server Error', status: 500 }})
        return
    }
    let data: Array<object> = []
    userAdmin.data.forEach((item: any) => {
        data.push({
            id: item.id,
            username: item.username,
            status: item.status == 2 ? true : false,
            create_time: item.create_time
        })
    })
    res.send({ data: data, meta: { msg: '获取成功',sum: userAdmin.sum, status: 200 }})
}

// 添加管理账户
const addAdminUser = async (req: any, res: any) => {
    const { username, password, status } = req.body
    if (username == '' || username == undefined || password == '' || password == undefined || status == '' || status == undefined) {
        res.send({data: {}, meta: { msg: '请求参数错误', status: 403 }})
        return
    }
    // 查询此账号是否有被添加过
    const userRes = await AdmimUser.queryNameAdmin(username)
    if (userRes == 500) {
        res.send({data: {}, meta: { msg: 'Server Error', status: 500 }})
        return
    } else if (userRes.length != 0) {
        res.send({data: {}, meta: { msg: '此用户名已被添加过', status: 403 }})
        return
    }
    // 保存到数据库
    const result = await AdmimUser.addAdminUser(username, password, status)
    if (result == 500) {
        res.send({data: {}, meta: { msg: 'Server Error', status: 500 }})
        return
    } else if (result == false) {
        res.send({data: {}, meta: { msg: '添加失败', status: 400 }})
        return
    }
    res.send({data: {}, meta: { msg: '添加成功', status: 201 }})
}

// 修改账号类型
const setAdminStatus = async (req: any, res: any) => {
    const { id, status } = req.query
    console.log(id, status)
    
    if (id == '' || id == undefined || status == '' || status == undefined) {
        res.send({data: {}, meta: { msg: '请求参数错误', status: 403 }})
        return
    }
    if (status == 1) {
        const AdminRes = await AdmimUser.getAdminSum()
        if (AdminRes == 500) {
            res.send({data: {}, meta: { msg: 'Server Error', status: 500 }})
            return
        } else if (AdminRes.sum <= 1) {
            res.send({data: {}, meta: { msg: '系统至少需要一个管理员账户', status: 403 }})
            return
        }
    }
    const result = await AdmimUser.setAdminStatus(id, status)
    if (result == 500) {
        res.send({data: {}, meta: { msg: 'Server Error', status: 500 }})
        return
    } else if (result == false) {
        res.send({data: {}, meta: { msg: '修改失败', status: 400 }})
        return
    }
    res.send({data: {}, meta: { msg: '修改成功', status: 201 }})
}

// 修改密码
const editAdmin = async (req: any, res: any) => {
    const { id, password } = req.body
    if (id == '' || id ==undefined || password == '' || password == undefined) {
        res.send({data: {}, meta: { msg: '请求参数错误', status: 403 }})
        return
    }
    const result = await AdmimUser.setAdminPassword(id, password)
    if (result == 500) {
        res.send({data: {}, meta: { msg: 'Server Error', status: 500 }})
        return
    } else if (result == false) {
        res.send({data: {}, meta: { msg: '修改失败', status: 400 }})
        return
    }
    res.send({data: {}, meta: { msg: '修改成功', status: 201 }})
}

// 删除用户
const delAdmin = async (req: any, res: any) => {
    const { id } = req.query
    if (id == '' || id ==undefined) {
        res.send({data: {}, meta: { msg: '请求参数错误', status: 403 }})
        return
    }
    // 查询此用户的信息
    const adminMsg = await AdmimUser.getIdAdminUser(id)
    if (adminMsg == 500) {
        res.send({data: {}, meta: { msg: 'Server Error', status: 500 }})
            return
    } else if (adminMsg.length == 0) {
        res.send({data: {}, meta: { msg: '无此用户', status: 403 }})
        return
    }
    if (adminMsg[0].status == 2) {
        const AdminRes = await AdmimUser.getAdminSum()
        if (AdminRes == 500) {
            res.send({data: {}, meta: { msg: 'Server Error', status: 500 }})
                return
        } else if (AdminRes.sum <= 1) {
            res.send({data: {}, meta: { msg: '系统至少需要一个管理员账户', status: 403 }})
            return
        }
    }
    const result = await AdmimUser.deleteAdminPassword(id)
    if (result == 500) {
        res.send({data: {}, meta: { msg: 'Server Error', status: 500 }})
        return
    } else if (result == false) {
        res.send({data: {}, meta: { msg: '修改失败', status: 400 }})
        return
    }
    res.send({data: {}, meta: { msg: '修改成功', status: 201 }})
}

module.exports = {
    adminLogin,
    allAdminUser,
    addAdminUser,
    setAdminStatus,
    editAdmin,
    delAdmin
}