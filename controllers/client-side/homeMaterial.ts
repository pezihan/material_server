var UserDB = require('../../modules/UserDB')
var MaterialDB = require('../../modules/MaterialDB')
var TagDB = require('../../modules/TagDB')
var nodejieba = require('nodejieba')

// 标签获取
const classify = async (req: any, res: any) => {
    const result = await MaterialDB.getTag()
    if (result == 500) {
        res.send({data: [], meta: { msg: '服务器错误', status: 500 }})
        return
    }
    res.send({data: result,meta:{msg: '获取成功',status: 200}})
}

// 获取推荐
const recommend = async (req: any, res: any) => {
    const { type, start, limit } = req.query
    if (type == '' || type == undefined || type < 1 || type > 3 || start == '' ||
    start == undefined || start < 1 || limit < 1 || limit == '' || limit == undefined) {
        res.send({data: [], meta: { msg: '请求参数错误', status: 404 }})
        return
    }
    const result = await MaterialDB.getAllMateria(type, start, limit)
    if (result == 500) {
        res.send({data: [], meta: { msg: '获取失败', status: 500 }})
        return
    }
    // 获取素材的素材的点赞、收藏、评论数量
    const materiaIdArr = result.map((v: any) => v.id)
    const statistics = await MaterialDB.getMaterialSum(materiaIdArr)
    if (statistics === 500) {
        res.send({data: [], meta: { msg: '数据库查询失败', status: 500 }})
        return
    }
    // 获取用户信息
    const userArr = result.map((v: any) => v.user_id)
    const userMessage = await UserDB.userArrMsg(userArr)
    if (userMessage == 500) {
        res.send({data: [], meta: { msg: '获取失败', status: 500 }})
        return
    }
    result.forEach((item: any, index: number) => {
        item.likeSum = 0
        item.collectSum = 0
        item.commentSum = 0
        item.userMsg = {}
        const i = userMessage.findIndex((v: any) => v.id == item.user_id)
        if (i != -1) {
            item.userMsg = {
                id: userMessage[i].id,
                user_image: userMessage[i].user_image,
                user_name: userMessage[i].user_name,
                phone: userMessage[i].phone,
                sex: userMessage[i].sex,
                region: userMessage[i].region,
                signature: userMessage[i].signature,
                user_type: userMessage[i].user_type
            }
        }
        // 点赞
        const likeIndex = statistics.like.findIndex((v: any) => v.scene_id === item.id)
        if (likeIndex !== -1) {
            item.likeSum = statistics.like[likeIndex]['COUNT(scene_id)']
        }
        // 收藏
        const collectIndex = statistics.collect.findIndex((v: any) => v.scene_id === item.id)
        if (collectIndex !== -1) {
            item.collectSum = statistics.collect[collectIndex]['COUNT(scene_id)']
        }
        // 评论
        const commentIndex = statistics.comment.findIndex((v: any) => v.scene_id === item.id)
        if (commentIndex !== -1) {
            item.commentSum = statistics.comment[commentIndex]['COUNT(scene_id)']
        }
    });
    res.send({data: result,meta:{msg: '获取成功',status: 200}})
}

// 获取分类素材
const sort = async (req: any, res: any) => {
    const { tag_id, type, start, limit } = req.query
    if (type == '' || type == undefined || type < 1 || type > 3 || start == '' || tag_id == '' ||
    tag_id == undefined || start == undefined || start < 1 || limit < 1 || limit == '' || limit == undefined) {
        res.send({data: [], meta: { msg: '请求参数错误', status: 403 }})
        return
    }
    // 查询此标签的素材
    const tagRes = await TagDB.getAllTagMateria(tag_id)
    if (tagRes == 500) {
        res.send({data: [], meta: { msg: '获取失败', status: 500 }})
        return
    }
    const Arr = tagRes.map((v: any) => v.scene_id)
    const result = await MaterialDB.queryMateria(Arr, type, start, limit)
    if (result == 500) {
        res.send({data: [], meta: { msg: '获取失败', status: 500 }})
        return
    }
    // 获取素材的素材的点赞、收藏、评论数量
    const materiaIdArr = result.map((v: any) => v.id)
    const statistics = await MaterialDB.getMaterialSum(materiaIdArr)
    if (statistics === 500) {
        res.send({data: [], meta: { msg: '数据库查询失败', status: 500 }})
        return
    }
    // 获取用户信息
    const userArr = result.map((v: any) => v.user_id)
    const userMessage = await UserDB.userArrMsg(userArr)
    if (userMessage == 500) {
        res.send({data: [], meta: { msg: '获取失败', status: 500 }})
        return
    }
    result.forEach((item: any, index: number) => {
        item.likeSum = 0
        item.collectSum = 0
        item.commentSum = 0
        item.userMsg = {}
        const i = userMessage.findIndex((v: any) => v.id == item.user_id)
        if (i != -1) {
            item.userMsg = {
                id: userMessage[i].id,
                user_image: userMessage[i].user_image,
                user_name: userMessage[i].user_name,
                phone: userMessage[i].phone,
                sex: userMessage[i].sex,
                region: userMessage[i].region,
                signature: userMessage[i].signature,
                user_type: userMessage[i].user_type
            }
        }
        // 点赞
        const likeIndex = statistics.like.findIndex((v: any) => v.scene_id === item.id)
        if (likeIndex !== -1) {
            item.likeSum = statistics.like[likeIndex]['COUNT(scene_id)']
        }
        // 收藏
        const collectIndex = statistics.collect.findIndex((v: any) => v.scene_id === item.id)
        if (collectIndex !== -1) {
            item.collectSum = statistics.collect[collectIndex]['COUNT(scene_id)']
        }
        // 评论
        const commentIndex = statistics.comment.findIndex((v: any) => v.scene_id === item.id)
        if (commentIndex !== -1) {
            item.commentSum = statistics.comment[commentIndex]['COUNT(scene_id)']
        }
    });
    res.send({data: result,meta:{msg: '获取成功',status: 200}})
}

// 搜索
const search = async (req: any, res: any) => {
    const { query, type, start, limit } = req.query
    if (type == '' || type == undefined || type < 1 || type > 3 || start == '' || start == undefined || start < 1 || limit < 1 || limit == '' || limit == undefined) {
        res.send({data: [], meta: { msg: '请求参数错误', status: 403 }})
        return
    } else if (query == '' || query == undefined) {
        res.send({data: [], meta: { msg: '搜索关键字为空', status: 403 }})
        return
    }
    // 分词
    const queryArr = nodejieba.cut(query)
    if (type == 4) {
        // 获取达人信息
        const userMsgArr = await UserDB.queryUser(queryArr, start, limit)
        if (userMsgArr == 500) {
            res.send({data: [], meta: { msg: '获取失败', status: 500 }})
            return
        }
        // 批量查询用户的粉丝与关注数量
        const user_Arr = userMsgArr.map((v: any) => v.id)
        const fansAtt = await UserDB.userArrAttention (user_Arr)
        if (fansAtt === 500) {
            res.send({data: [], meta: { msg: '服务器错误', status: 500 }})
            return
        }
        let data:any = []
        userMsgArr.forEach((item: any) => {
            let usermsg = {
                user_id: item.id,
                user_image: item.user_image,
                user_name: item.user_name,
                sex: item.sex,
                region: item.region,
                signature: item.signature,
                user_type: item.user_type,
                fansSum: 0,
                holdSum: 0
            }
            const holdIndex = fansAtt.holdSum.findIndex((v: any) => v.user_id == usermsg.user_id)
            if (holdIndex !== -1) {
                usermsg.holdSum = fansAtt.holdSum[holdIndex]['COUNT(user_id)']
            }
            const fansIndex = fansAtt.fansSum.findIndex((v: any) => v.user_id == usermsg.user_id)
            if (fansIndex !== -1) {
                usermsg.fansSum = fansAtt.fansSum[fansIndex]['COUNT(hold_id)']
            }
            data.push(usermsg)
        });
        res.send({data: data,meta:{msg: '获取成功',status: 200}})
    }
}

module.exports = {
    classify,
    recommend,
    sort,
    search
}