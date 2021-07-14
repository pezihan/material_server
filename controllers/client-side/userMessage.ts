const db = require('../../util/mysqlConfig')
const Tool = require('../../lib/Tool')
const VerifyPhone = require('../../lib/VerifyPhone')
var UserDB = require('../../modules/UserDB')
var Token = require('../../util/tokenconfig')
var Mulet = require('../../util/multerconfig')
var configKey = require('../../util/Key')
var verifyPhone = new VerifyPhone()

// 测试
const test = (req: any, res: any) => {
    res.send(req.userMsg)
}

// 发送验证码
const verify = (req: any, res: any) => {
    const { phone } = req.query
    if (!phone) {
        res.send({data: {}, meta: { msg: '无手机号码', status: 404 }})
        return
    }
    const code = Tool.rand(1000,9999)
    verifyPhone.setCode(phone, code)
    console.log(verifyPhone.getCode(phone))
    res.send({data: {}, meta: { msg: '已发送', status: 200 }})
}

// 注册
const sign = async (req: any, res: any) => {
    const { phone, verification, password } = req.body
    const user_image: string = 'default.jpg' // 默认头像
    if (phone == '' || phone == undefined || verification == '' || verification == undefined || password == undefined || password == '') {
        res.send({data: {}, meta: { msg: '请求参数错误', status: 404 }})
        return
    }
    // 验证码
    const code = verifyPhone.getCode(phone)
    const time = new Date().getTime()
    if (code.code === null || code.code !== Number(verification)) {
        res.send({data: {}, meta: { msg: '验证码错误', status: 403 }})
        return
    } else if (code.time + 120000 < time) {  // 验证2 分钟过期
        res.send({data: {}, meta: { msg: '验证码已过期', status: 403 }})
        return
    }
    // 查询数据库此手机号码是否存在注册
    const result = await UserDB.getUserPhone(phone)
    if (result == 500) {
        res.send({data: {}, meta: { msg: '服务器错误', status: 500 }})
        return
    } else if (result.length !== 0) {
        res.send({data: {}, meta: { msg: '此号码已注册过', status: 403 }})
        return
    }
    // 添加用户信息到数据库
    const msg = await UserDB.setUser(phone, password, user_image)
    if (msg == 500) {
        res.send({data: {}, meta: { msg: '服务器错误', status: 500 }})
        return
    } else if (msg == false) {
        res.send({data: {}, meta: { msg: '注册失败', status: 400 }})
        return
    }
    res.send({data: { id: msg }, meta: { msg: '注册成功', status: 201 }})
}

// 登录
const login = async (req: any, res: any) => {
    const { phone, password } = req.body
    if (phone == '' || phone == undefined || password == undefined || password == '') {
        res.send({data: {}, meta: { msg: '请求参数错误', status: 404 }})
        return
    }
    // 查询数据库此手机号码是否存在注册
    const result = await UserDB.getUserPhone(phone)
    if (result == 500) {
        res.send({data: {}, meta: { msg: '服务器错误', status: 500 }})
        return
    } else if (result.length === 0) {
        res.send({data: {}, meta: { msg: '此号码未注册过', status: 403 }})
        return
    } else if (result[0].password !== password.trim()) {
        res.send({data: {}, meta: { msg: '账号或密码错误', status: 403 }})
        return
    } else if (result[0].user_type === 1) {
        res.send({data: {}, meta: { msg: '账号违规，已封号', status: 403 }})
        return
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
        token: token
    }
    // 判断用户资料是否完善
    if (result[0].user_image === null || result[0].user_name === null ) {
        res.send({data, meta: { msg: '请完善个人信息', status: 100 }})
        return
    }
    res.send({ data, meta: { msg: '登录成功', status: 200 }})
}

// 获取资源访问路径
const resource = async (req: any, res: any) => {
    let data:any = {}
    data.images = 'http://127.0.0.1:5000' + configKey.visitPath.images
    data.video = 'http://127.0.0.1:5000' + configKey.visitPath.video
    data.user_images = 'http://127.0.0.1:5000' + configKey.visitPath.user_images
    data = configKey.visitPath
    res.send({data: data, meta: { msg: '获取成功', status: 200 }})
}

// 用户信息获取
const userMsg = async (req: any, res: any) => {
    const { user_id } = req.query
    if (user_id  == '' || user_id == undefined) {
        res.send({data: {}, meta: { msg: '请求参数错误', status: 404 }})
        return
    }
    // 查询用户信息
    const userMsg = await UserDB.getIdUserMsg(user_id)
    if (userMsg == 500) {
        res.send({data: {}, meta: { msg: '服务器错误', status: 500 }})
        return
    } else if (userMsg.length === 0) {
        res.send({data: {}, meta: { msg: '无此用户', status: 500 }})
        return
    }
    // 查询用户的关注数量与粉丝数量
    const result = await UserDB.userAttention(user_id, 1)
    if (result == 500) {
        res.send({data: {}, meta: { msg: '服务器错误', status: 500 }})
        return
    }
    // 查询此人是否有关注
    const userHoldMsg = req.userMsg != undefined ? await UserDB.allholdList(req.userMsg.id, user_id) : []
    if (userHoldMsg == 500) {
        res.send({data: {}, meta: { msg: '服务器错误', status: 500 }})
        return
    }
    const data = {
        id: userMsg[0].id,
        user_image: userMsg[0].user_image,
        user_name: userMsg[0].user_name,
        creat_time: userMsg[0].creat_time,
        sex: userMsg[0].sex,
        region: userMsg[0].region,
        signature: userMsg[0].signature,
        user_type: userMsg[0].user_type,
        fansSum: result.sum.fans,
        holdSum: result.sum.hold,
        hold: userHoldMsg.length == 0 ? false : true
    }
    res.send({data: data, meta: { msg: '获取成功', status: 200 }})
}

// 上传头像
const upUserImages = async (req: any, res: any) => {
    Mulet.updateUserImg (req, res, async (err: any) => {
        if(!!err){
            res.send({data:{},meta:{msg: '超过服务器传输限制',status: 400}})
            return;
        }
        if(!!req.file){
            res.send({data:{path: req.filePath},meta:{msg: '上传成功',status: 201}})
        } else {
            res.send({data:{},meta:{msg: '只支持jpg/jpeg/png格式图片',status: 400}})
        }
    })
}

// 修改用户信息
const setUserMsg = async (req: any, res: any) => {
    const { user_image, user_name, sex, region, signature } = req.body
    if (user_image == undefined || user_image == '' || user_name == undefined || user_name == '' || sex == undefined
    || region == undefined || signature == undefined) {
        res.send({data: {}, meta: { msg: '请求参数错误', status: 403 }})
        return
    }
    const result = await UserDB.setUserMsg(req.userMsg.id,user_image, user_name, sex, region, signature)
    if (result == 500) {
        res.send({data: {}, meta: { msg: '服务器错误', status: 500 }})
        return
    } else if (result == false) {
        res.send({data: {}, meta: { msg: '修改失败', status: 400 }})
        return
    }
    res.send({data: {}, meta: { msg: '已完成', status: 201 }})
}

// 修改用户资料背景
const background = async (req: any, res: any) => {
    req.storagePath = 'material_images'
    Mulet.updateImg (req, res,async (err: any) => {
        const userMsg = req.userMsg
        if(!!err){
            res.send({data:{},meta:{msg: '超过服务器传输限制',status: 400}})
            return;
        }
        if(!!req.file){
            // 保存到数据库
            const result = await UserDB.setUserBackground(userMsg.id, req.filePath)
            if (result == 500) {
                res.send({data:{},meta:{msg: '更换失败',status: 500}})
                return
            } else if (result == false) {
                res.send({data:{},meta:{msg: '更换失败',status: 400}})
                return
            }
            res.send({data:{path: req.filePath},meta:{msg: '更换成功',status: 201}})
        } else {
            res.send({data:{},meta:{msg: '只支持jpg/jpeg/png格式图片',status: 400}})
        }
    })
}

// 获取用户关注与粉丝的详细数据
const holdlist = async (req: any, res: any)  => {
    const { user_id, type, start, limit } = req.query
    if (user_id == '' || user_id == undefined || type == '' || type == undefined ||
    start == '' || start == undefined || type < 1 || type > 2 || limit == '' || limit == undefined||
    limit < 1 || start < 1) {
        res.send({data: [], meta: { msg: '请求参数错误', status: 403 }})
        return
    }
    const status = type == 1 ? 2 : 3
    const result = await UserDB.userAttention(user_id, status, start, limit)
    if (result == 500) {
        res.send({data: [], meta: { msg: '服务器错误', status: 500 }})
        return
    }
    // 关注 ： 粉丝
    const user_Arr = status === 2 ? result.data.map((v: any) => v.hold_id) : result.data.map((v: any) => v.user_id)
    // 批量查询用户信息
    const userList = await UserDB.userArrMsg(user_Arr)
    if (userList == 500) {
        res.send({data: [], meta: { msg: '服务器错误', status: 500 }})
        return
    }
    // 批量查询用户的粉丝与关注数量
    const fansAtt = await UserDB.userArrAttention (user_Arr)
    if (fansAtt === 500) {
        res.send({data: [], meta: { msg: '服务器错误', status: 500 }})
        return
    }

    let data:any = []
    result.data.forEach((item1: any, index1: number )=> {
        let usermsg: any = {}
        let index = -1
        if (status === 2) {
            index = userList.findIndex((v: any) => v.id == item1.hold_id) // 我关注的人
        } else {
            index = userList.findIndex((v: any) => v.id == item1.user_id)  // 我的粉丝
        }
        if (index !== -1) {
            usermsg = {
                user_id: item1.hold_id,
                hold_time: item1.hold_time,
                user_image: userList[index].user_image,
                user_name: userList[index].user_name,
                sex: userList[index].sex,
                region: userList[index].region,
                signature: userList[index].signature,
                user_type: userList[index].user_type,
                fansSum: 0,
                holdSum: 0
            }
        }
        const holdIndex = fansAtt.holdSum.findIndex((v: any) => v.user_id == usermsg.user_id)
        if (holdIndex !== -1) {
            usermsg.holdSum = fansAtt.holdSum[holdIndex]['COUNT(user_id)']
        }
        const fansIndex = fansAtt.fansSum.findIndex((v: any) => v.user_id == usermsg.user_id)
        if (fansIndex !== -1) {
            usermsg.fansSum = fansAtt.fansSum[fansIndex]['COUNT(hold_id)']
        }
        if (usermsg != {}) {
            data.push(usermsg)
        }
    });
    res.send({data: { userList: data, fansSum: result.sum.fans, holdSum: result.sum.hold }, meta: { msg: '获取成功', status: 200 }})
}

// 关注与取消关注
const hold = async (req: any, res: any) => {
    const { user_id } = req.query
    if (user_id == "" || user_id == undefined) {
        res.send({data: [], meta: { msg: '请求参数错误', status: 403 }})
        return
    }
    // 查询此用户是否存在
    const userListMsg = await UserDB.getIdUserMsg(user_id)
    if (userListMsg == 500) {
        res.send({data: [], meta: { msg: '操作失败', status: 500 }})
        return
    } else if (userListMsg.length == 0) {
        res.send({data: [], meta: { msg: '此用户不存在或已注销', status: 404 }})
        return
    }
    let result;
    // 查询此用户目前是关注还是没有关注
    const msg = await UserDB.allholdList (req.userMsg.id, user_id)
    if (msg == 500) {
        res.send({data: [], meta: { msg: '操作失败', status: 500 }})
        return
    } else if (msg.length == 0) {
        // 没有关注过
        result = await UserDB.addHoldMsg(req.userMsg.id, user_id)
    } else {
        // 已经关注过 （删除）
        result = await UserDB.removeHoldMsg(req.userMsg.id, user_id)
    }
    if (result == 500) {
        res.send({data: [], meta: { msg: '操作失败', status: 500 }})
        return
    } else if (result == false) {
        res.send({data: [], meta: { msg: '操作失败', status: 400 }})
        return
    }
    res.send({data: [], meta: { msg: msg.length == 0 ? '已关注' : '已取消关注', status: 200 }})
}

module.exports = {
    test,
    verify,
    sign,
    login,
    resource,
    userMsg,
    upUserImages,
    setUserMsg,
    background,
    holdlist,
    hold
}