var UserDB = require('../../modules/UserDB')
var MaterialDB = require('../../modules/MaterialDB')
var TagDB = require('../../modules/TagDB')
var CommentBD = require('../../modules/CommentDB')
// 载入模块
var Segment = require('node-segment').Segment;
// 创建实例
var segment = new Segment();
// 使用默认的识别模块及字典
segment.useDefault();

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
    // 获取我所有点赞的素材
    let likeScene:any = [] 
    if (req.userMsg !== undefined) { // 用户是登录访问的
        likeScene = await MaterialDB.queryLikeList(req.userMsg.id)
        if (likeScene == 500) {
            res.send({data: [], meta: { msg: '获取失败', status: 500 }})
            return
        }
    }
    result.forEach((item: any, index: number) => {
        item.likeSum = 0
        item.collectSum = 0
        item.commentSum = 0
        item.like = likeScene.length == 0 ? false : likeScene.some((v: any) => v.scene_id == item.id && v.type == 1)
        item.collect = likeScene.length == 0 ? false :  likeScene.some((v: any) => v.scene_id == item.id && v.type == 2)
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
    })
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
    // 获取我所有点赞的素材
    let likeScene:any = [] 
    if (req.userMsg !== undefined) { // 用户是登录访问的
        likeScene = await MaterialDB.queryLikeList(req.userMsg.id)
        if (likeScene == 500) {
            res.send({data: [], meta: { msg: '获取失败', status: 500 }})
            return
        }
    }
    result.forEach((item: any, index: number) => {
        item.likeSum = 0
        item.collectSum = 0
        item.commentSum = 0
        item.like = likeScene.length == 0 ? false : likeScene.some((v: any) => v.scene_id == item.id && v.type == 1)
        item.collect = likeScene.length == 0 ? false :  likeScene.some((v: any) => v.scene_id == item.id && v.type == 2)
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
    if (type == '' || type == undefined || type < 1 || type > 4 || start == '' || start == undefined || start < 1 || limit < 1 || limit == '' || limit == undefined) {
        res.send({data: [], meta: { msg: '请求参数错误', status: 403 }})
        return
    } else if (query == '' || query == undefined) {
        res.send({data: [], meta: { msg: '搜索关键字为空', status: 403 }})
        return
    }
    const str = query.replace(/[\ |\~|\`|\!|\@|\#|\。|\$|\%|\^|\&|\*|\(|\)|\-|\_|\+|\=|\||\\|\[|\]|\{|\}|\;|\:|\"|\'|\,|\<|\.|\>|\/|\?]/g,"");
    // 分词
    let queryArr = segment.doSegment(str).map((v: any) => v.w)
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
    } else {
        // 素材
        // 查询此标签的素材
        const tagRes = await TagDB.querymaterialTag(queryArr)
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
        // 获取我所有点赞的素材
        let likeScene:any = [] 
        if (req.userMsg !== undefined) { // 用户是登录访问的
            likeScene = await MaterialDB.queryLikeList(req.userMsg.id)
            if (likeScene == 500) {
                res.send({data: [], meta: { msg: '获取失败', status: 500 }})
                return
            }
        }
        result.forEach((item: any, index: number) => {
            item.likeSum = 0
            item.collectSum = 0
            item.commentSum = 0
            item.like = likeScene.length == 0 ? false : likeScene.some((v: any) => v.scene_id == item.id && v.type == 1)
            item.collect = likeScene.length == 0 ? false :  likeScene.some((v: any) => v.scene_id == item.id && v.type == 2)
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
    const user_id = req.userMsg == undefined ? 0 : req.userMsg.id
    // 将将关键词写入数据库
    TagDB.setKeyword(queryArr, user_id)
}

// 热搜
const hotSearch = async (req: any, res: any) => {
    const { limit } = req.query
    if (limit == '') {
        res.send({data: [], meta: { msg: '请求参数错误', status: 403 }})
        return
    }
    const result = await TagDB.getHotSearch(1, limit)
    if (result == 500) {
        res.send({data: [], meta: { msg: '获取失败', status: 500 }})
        return
    }
    res.send({data: result, meta: { msg: '获取成功', status: 200 }})
}

// 素材详细页面
const particulars = async (req: any, res: any) => {
    const { scene_id } = req.query
    if (scene_id == '' || scene_id == undefined) {
        res.send({data: {}, meta: { msg: '请求参数错误', status: 403 }})
        return
    }
    // 查询素材信息
    const sceneMsg = await MaterialDB.getArrUserMaterial([scene_id])
    if (sceneMsg === 500) {
        res.send({data: {}, meta: { msg: '获取失败', status: 500 }})
        return
    } else if (sceneMsg.length === 0) {
        res.send({data: {}, meta: { msg: '素材不存在', status: 404 }})
        return
    }
    // 获取素材评论、点赞、收藏数量
    const statistics = await MaterialDB.getMaterialSum([sceneMsg[0].id])
    if (statistics === 500) {
        res.send({data: [], meta: { msg: '数据库查询失败', status: 500 }})
        return
    }
    // 获取用户信息
    const userRes = await UserDB.getIdUserMsg(sceneMsg[0].user_id)
    if (userRes == 500) {
        res.send({data: [], meta: { msg: '数据库查询失败', status: 500 }})
        return
    } else if (userRes.length == 0) {
        res.send({data: [], meta: { msg: '未查到此用户', status: 404 }})
        return
    }
    // 获取我所有点赞的素材
    let likeScene:any = [] 
    if (req.userMsg !== undefined) { // 用户是登录访问的
        likeScene = await MaterialDB.queryLikeList(req.userMsg.id)
        if (likeScene == 500) {
            res.send({data: [], meta: { msg: '获取失败', status: 500 }})
            return
        }
    }
    const data = {
        ...sceneMsg[0],
        // 点赞数量
        likeSum: statistics.like[0]['COUNT(scene_id)'],
        // 收藏数量
        collectSum: statistics.collect[0]['COUNT(scene_id)'],
        // 评论数量
        commentSum: statistics.comment[0]['COUNT(scene_id)'],
        like: likeScene.length == 0 ? false : likeScene.some((v: any) => v.scene_id == sceneMsg[0].id && v.type == 1),
        collect: likeScene.length == 0 ? false :  likeScene.some((v: any) => v.scene_id == sceneMsg[0].id && v.type == 2),
        userMsg: {
            id: userRes[0].id,
            user_image: userRes[0].user_image,
            user_name: userRes[0].user_name,
            phone: userRes[0].phone,
            sex: userRes[0].sex,
            region: userRes[0].region,
            signature: userRes[0].signature,
            user_type: userRes[0].user_type
        }
    }
    res.send({data: data,meta:{msg: '获取成功',status: 200}})
}

// 获取素材类似推荐
const similarity = async (req: any, res: any) => {
    const { scene_id } = req.query
    if (scene_id == '' || scene_id == undefined) {
        res.send({data: [], meta: { msg: '请求参数错误', status: 403 }})
        return
    }
    let result = []
    // 查询素材信息
    const sceneMsg = await MaterialDB.getArrUserMaterial([scene_id])
    if (sceneMsg === 500) {
        res.send({data: [], meta: { msg: '获取失败', status: 500 }})
        return
    } else if (sceneMsg.length === 0) {
        res.send({data: [], meta: { msg: '素材不存在', status: 404 }})
        return
    }
    // 查找素材标签
    const tagMsg = await TagDB.querySceneTag([scene_id])
    if (tagMsg == 500) {
        res.send({data: [], meta: { msg: '获取失败', status: 500 }})
        return
    } else if (tagMsg.length == 0) {
        // 没有相似推荐
        result = await MaterialDB.getAllMateria(3, 1, 4)
    } else {
        const sceneArr = tagMsg.map((v: any) => v.scene_id)
        const resAwi = await MaterialDB.getArrUserMaterial(sceneArr)
        result = resAwi.slice(0,4)
    }
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
    result.forEach((item: any, index: number) => {
        item.likeSum = 0
        item.collectSum = 0
        item.commentSum = 0
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
    })
    res.send({data: result, meta:{msg: '获取成功',status: 200}})
}

// 获取素材评论
const getComment = async (req: any, res: any) => {
    const { scene_id, start, limit } = req.query
    if (start == '' || start == undefined || limit == '' || limit == undefined || scene_id == '' || scene_id == undefined
    || start < 1 || limit < 1) {
        res.send({data: [], meta: { msg: '请求参数错误', status: 403 }})
        return
    }
    const oneComment =  await CommentBD.getOneComment(scene_id, start, limit)
    if (oneComment == 500) {
        res.send({data: [], meta: { msg: '获取失败', status: 500 }})
        return
    }
    // 查询二级评论
    const commentArr = oneComment.map((v: any) => v.id)
    const twoComment = await CommentBD.getTwoComment(commentArr)
    if (twoComment == 500) {
        res.send({data: [], meta: { msg: '获取失败', status: 500 }})
        return
    }
    const userArr = [...oneComment.map((v: any) => v.user_id), ...twoComment.map((v: any) => v.user_id)]
    const userMsgs = await UserDB.userArrMsg(userArr)
    if (userMsgs == 500) {
        res.send({data: [], meta: { msg: '获取失败', status: 500 }})
        return
    }
    oneComment.forEach((item1: any) => {
        item1.commentTwo = []
        const index1 = userMsgs.findIndex((i: any) => i.id == item1.user_id)
        item1.user_name = userMsgs[index1].user_name
        item1.user_image = userMsgs[index1].user_image
        item1.sex = userMsgs[index1].sex
        twoComment.forEach((item3: any) => {
            if (item1.id == item3.comment_id) {
                const index2 = userMsgs.findIndex((i: any) => i.id == item3.user_id)
                item3.user_name = userMsgs[index2].user_name
                item3.user_image = userMsgs[index2].user_image
                item3.sex = userMsgs[index2].sex
                item1.commentTwo.push(item3)
            }
        })
    })
    res.send({data: oneComment, meta:{msg: '获取成功',status: 200}})
}

module.exports = {
    classify,
    recommend,
    sort,
    search,
    hotSearch,
    particulars,
    similarity,
    getComment
}