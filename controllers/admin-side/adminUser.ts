var UserDB = require('../../modules/UserDB')
var MaterialDB = require('../../modules/MaterialDB')
var configKey = require('../../util/Key')
var Mulet = require('../../util/multerconfig')
var TagDB = require('../../modules/TagDB')

// 获取所有用户
const userList = async (req: any, res: any) => {
    const { query, start, limit } = req.query
    if (start == "" || start == undefined || limit == "" || limit == undefined || start < 1 || limit < 1) {
        res.send({data: {}, meta: { msg: '请求参数错误', status: 403 }})
        return
    }
    const result = await UserDB.adminGetUser(query, start, limit)
    if (result == 500) {
        res.send({data: {}, meta: { msg: 'Server error', status: 500 }})
        return
    }
    // 查询用户的作品数量
    const userArr = result.data.map((v:any) => v.id)
    const material = await MaterialDB.adminUserMaterialSum(userArr)
    if (material == 500) {
        res.send({data: {}, meta: { msg: 'Server error', status: 500 }})
        return
    }
    result.data.forEach((item: any) => {
        item.videoSum = 0
        item.imagesSum = 0
        const index1 = material.video.findIndex((v:any) => v.user_id == item.id)
        if (index1 != -1) {
            item.videoSum = material.video[index1]['COUNT(user_id)']
        }
        const index2 = material.images.findIndex((v:any) => v.user_id == item.id)
        if (index2 != -1) {
            item.videoSum = material.images[index2]['COUNT(user_id)']
        }
    })
    res.send({data: result.data, meta: { msg: '获取成功',sum: result.sum, status: 200 }})
}

// 获取资源访问路径
const getPath = async (req: any, res: any) => {
    let data:any = {}
    // data.images = 'http://127.0.0.1:5000' + configKey.visitPath.images
    // data.video = 'http://127.0.0.1:5000' + configKey.visitPath.video
    // data.user_images = 'http://127.0.0.1:5000' + configKey.visitPath.user_images
    data = configKey.visitPath
    res.send({data: data, meta: { msg: '获取成功', status: 200 }})
}

// 上传用户头像
const updateimage = async (req: any, res: any) => {
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

// 添加用户
const addVirtualUser = async (req: any, res: any) => {
    const { user_image, user_name, sex, region, phone, password, signature } = req.body
    if (user_image == '' || user_image == undefined || user_name == '' || user_name == undefined
    || sex == undefined || region == '' || region == undefined || phone == ''
    || phone == undefined || password == '' || password == undefined) {
        res.send({data: {}, meta: { msg: '请求参数错误', status: 403 }})
        return
    }
    // 查询此用户是否存在
    // 查询数据库此手机号码是否存在注册
    const result = await UserDB.getUserPhone(phone)
    if (result == 500) {
        res.send({data: {}, meta: { msg: 'Server Error', status: 500 }})
        return
    } else if (result.length !== 0) {
        res.send({data: {}, meta: { msg: '此账户已注册过', status: 403 }})
        return
    }
    const AddUserRes = await UserDB.adminAddUser(user_image, user_name, sex, region, phone, password, signature)
    if (AddUserRes == 500) {
        res.send({data: {}, meta: { msg: 'Server Error', status: 500 }})
        return
    } else if (AddUserRes == false) {
        res.send({data: {}, meta: { msg: '添加失败', status: 403 }})
        return
    }
    res.send({data: {}, meta: { msg: '添加成功', status: 201 }})
}

// 修改用户信息
const setVirtualUser = async (req: any, res: any) => {
    const { user_id,user_image, user_name, sex, region, phone, signature } = req.body
    if (user_image == '' || user_image == undefined || user_name == '' || user_name == undefined
    || sex == undefined || region == '' || region == undefined || phone == ''
    || phone == undefined || user_id == '' || user_id == undefined) {
        res.send({data: {}, meta: { msg: '请求参数错误', status: 403 }})
        return
    }
    const result = await UserDB.adminSetUserMsg(user_id,user_image, user_name, sex, region, phone, signature)
    if (result == 500) {
        res.send({data: {}, meta: { msg: 'Server Error', status: 500 }})
        return
    } else if (result == false) {
        res.send({data: {}, meta: { msg: '修改失败', status: 403 }})
        return
    }
    res.send({data: {}, meta: { msg: '修改成功', status: 201 }})
}

// 修改用户密码
const virtualReset = async (req: any, res: any) => {
    const { user_id, password } = req.body
    if (user_id == '' || user_id == undefined ||password == '' || password == undefined) {
        res.send({data: {}, meta: { msg: '请求参数错误', status: 403 }})
        return
    }
    const result = await UserDB.adminSetPassword(user_id, password)
    if (result == 500) {
        res.send({data: {}, meta: { msg: 'Server Error', status: 500 }})
        return
    } else if (result == false) {
        res.send({data: {}, meta: { msg: '修改失败', status: 403 }})
        return
    }
    res.send({data: {}, meta: { msg: '修改成功', status: 201 }})
}

// 封号与解除封号
const sealUser = async (req: any, res: any) => {
    const { user_id } = req.query
    if (user_id == '' || user_id == undefined) {
        res.send({data: {}, meta: { msg: '请求参数错误', status: 403 }})
        return
    }
    // 查询此账号目前的状态
    const userMsg = await UserDB.getIdUserMsg(user_id)
    if (userMsg == 500) {
        res.send({data: {}, meta: { msg: 'Server Error', status: 500 }})
        return
    } else if (userMsg.length == 0) {
        res.send({data: {}, meta: { msg: '未查到此用户', status: 404 }})
        return
    }
    const user_type = userMsg[0].user_type == 1 ? 0 : 1
    const result = await UserDB.setUserType(user_type, user_id)
    if (result == 500) {
        res.send({data: {}, meta: { msg: 'Server Error', status: 500 }})
        return
    } else if (result == false) {
        res.send({data: {}, meta: { msg: '修改失败', status: 403 }})
        return
    }
    res.send({data: { user_type }, meta: { msg: '修改成功', status: 201 }})
}

// 删除用户
const virtualUserDel = async (req: any, res: any) => {
    const { user_id } = req.query
    if (user_id == '' || user_id == undefined) {
        res.send({data: {}, meta: { msg: '请求参数错误', status: 403 }})
        return
    }
    // 删除用户信息
    const userRes = await UserDB.deleteUser(user_id)
    if (userRes == 500) {
        res.send({data: {}, meta: { msg: 'Server Error', status: 500 }})
        return
    } else if (userRes == false) {
        res.send({data: {}, meta: { msg: '删除失败', status: 403 }})
        return
    }
    res.send({data: {}, meta: { msg: '删除成功', status: 201 }})
    // 将此用户的所有素材修改为删除状态
    const sceneRes = await MaterialDB.deleteSceneUser(user_id)
    if (sceneRes == 500) {
        console.log(`用户${user_id}删除账号素材修改为删除状态失败,code:`,sceneRes)
    }
}

// 获取关键词
const getkeyword = async (req: any, res: any) => {
    const { query, start, limit } = req.query
    if (start == "" || start == undefined || limit == "" || limit == undefined || start < 1 || limit < 1) {
        res.send({data: {}, meta: { msg: '请求参数错误', status: 403 }})
        return
    }
    const result = await TagDB.getSearchList(start, limit, query)
    if (result == 500) {
        res.send({data: {}, meta: { msg: 'Server error', status: 500 }})
        return
    }
    res.send({data: result.data, meta: { msg: '获取成功',sum: result.sum, status: 200 }})
}

// 删除关键词
const delkeyword = async (req: any, res: any) => {
    const { keyword } = req.query
    if (keyword == undefined) {
        res.send({data: {}, meta: { msg: '请求参数错误', status: 403 }})
        return
    }
    const result = await TagDB.deleteKeyword(keyword)
    if (result == 500) {
        res.send({data: {}, meta: { msg: 'Server error', status: 500 }})
        return
    } else if (result == false) {
        res.send({data: {}, meta: { msg: '删除失败', status: 400 }})
        return
    }
    res.send({data: {}, meta: { msg: '删除成功', status: 201 }})
}

// 批量删除搜索关键词
const delAllkeyword = async (req: any, res: any) => {
    const { keyword_arr } = req.body
    if (Array.isArray(keyword_arr) == false || keyword_arr.length == 0) {
        res.send({data: {}, meta: { msg: '请求参数错误', status: 403 }})
        return
    }
    const result = await TagDB.deleteArrKeyword(keyword_arr)
    if (result == 500) {
        res.send({data: {}, meta: { msg: 'Server error', status: 500 }})
        return
    } else if (result == false) {
        res.send({data: {}, meta: { msg: '删除失败', status: 400 }})
        return
    }
    res.send({data: {}, meta: { msg: '删除成功', status: 201 }})
}

// 修改关键词
const setkeyword = async (req: any, res: any) => {
    const { keyword, newKeyword } = req.body
    if (keyword == '' || keyword == undefined || newKeyword == '' || newKeyword == undefined) {
        res.send({data: {}, meta: { msg: '请求参数错误', status: 403 }})
        return
    }
    const result = await TagDB.setUserKeyword(newKeyword.trim(), keyword)
    if (result == 500) {
        res.send({data: {}, meta: { msg: 'Server error', status: 500 }})
        return
    } else if (result == false) {
        res.send({data: {}, meta: { msg: '修改失败', status: 400 }})
        return
    }
    res.send({data: {}, meta: { msg: '修改成功', status: 201 }})
}


module.exports = {
    userList,
    getPath,
    updateimage,
    addVirtualUser,
    setVirtualUser,
    virtualReset,
    sealUser,
    virtualUserDel,
    getkeyword,
    delkeyword,
    delAllkeyword,
    setkeyword
}