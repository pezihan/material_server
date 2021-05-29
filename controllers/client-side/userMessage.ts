const db = require('../../util/mysqlConfig')
const Tool = require('../../lib/Tool')
const VerifyPhone = require('../../lib/VerifyPhone')
var UserDB = require('../../modules/UserDB')
var Token = require('../../util/tokenconfig')
var verifyPhone = new VerifyPhone()

// 测试
const test = (req: any, res: any) => {
    console.log('req');
    console.log(req.userMsg);
    res.send(req.userMsg)
}

// 发送验证码
const verify = (req: any, res: any) => {
    const { phone } = req.query
    if (!phone) {
        res.send({data: {}, meta: { msg: '无手机号码', status: 404 }})
    }
    const code = Tool.rand(1000,9999)
    verifyPhone.setCode(phone, code)
    console.log(verifyPhone.getCode(phone))
    res.send({data: {}, meta: { msg: '已发送', status: 200 }})
}

// 注册
const sign = async (req: any, res: any) => {
    const { phone, verification, password } = req.body
    if (phone == '' || phone == undefined || verification == '' || verification == undefined || password == undefined || password == '') {
        res.send({data: {}, meta: { msg: '请求参数错误', status: 404 }})
    }
    // 验证码
    const code = verifyPhone.getCode(phone)
    const time = new Date().getTime()
    if (code.code === null || code.code !== Number(verification)) {
        res.send({data: {}, meta: { msg: '验证码错误', status: 403 }})
    } else if (code.time + 120000 < time) {  // 验证2 分钟过期
        res.send({data: {}, meta: { msg: '验证码已过期', status: 403 }})
    }
    // 查询数据库此手机号码是否存在注册
    const result = await UserDB.getUserPhone(phone)
    if (result == 500) {
        res.send({data: {}, meta: { msg: '服务器错误', status: 500 }})
    } else if (result.length !== 0) {
        res.send({data: {}, meta: { msg: '此号码已注册过', status: 403 }})
    }
    // 添加用户信息到数据库
    const msg = await UserDB.setUser(phone, password)
    if (msg == 500) {
        res.send({data: {}, meta: { msg: '服务器错误', status: 500 }})
    } else if (msg == false) {
        res.send({data: {}, meta: { msg: '注册失败', status: 400 }})
    }
    res.send({data: { id: msg }, meta: { msg: '注册成功', status: 201 }})
}

// 登录
const login = async (req: any, res: any) => {
    const { phone, password } = req.body
    if (phone == '' || phone == undefined || password == undefined || password == '') {
        res.send({data: {}, meta: { msg: '请求参数错误', status: 404 }})
    }
    // 查询数据库此手机号码是否存在注册
    const result = await UserDB.getUserPhone(phone)
    if (result == 500) {
        res.send({data: {}, meta: { msg: '服务器错误', status: 500 }})
    } else if (result.length === 0) {
        res.send({data: {}, meta: { msg: '此号码未注册过', status: 403 }})
    } else if (result[0].password !== password.trim()) {
        res.send({data: {}, meta: { msg: '账号或密码错误', status: 403 }})
    } else if (result[0].user_type === 1) {
        res.send({data: {}, meta: { msg: '账号违规，已封号', status: 403 }})
    }
    // 生成token
    const token = Token.en({id:result[0].id, time: new Date().getTime()})
    const data = {
        id: result[0].id,
        user_image: result[0].user_image,
        user_name: result[0].user_name,
        phone: result[0].phone,
        creat_time: result[0].creat_time,
        sex: result[0].sex,
        region: result[0].region,
        signature: result[0].signature,
        roken: token
    }
    // 判断用户资料是否完善
    if (result[0].user_image === null || result[0].user_name === null ) {
        res.send({data, meta: { msg: '请完善个人信息', status: 100 }})
        return
    }
    res.send({ data, meta: { msg: '账号或密码错误', status: 200 }})
}

module.exports = {
    test,
    verify,
    sign,
    login
}