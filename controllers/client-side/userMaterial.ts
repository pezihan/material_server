var UserDB = require('../../modules/UserDB')
var MaterialDB = require('../../modules/MaterialDB')


// 获取用户的主页素材
const usermaterial = async (req: any, res: any) => {
    const { user_id, type, start, limit } = req.query
    if (user_id == '' || user_id == undefined || type == '' || type == undefined||
    start == '' || start == undefined || limit == '' || limit == undefined) {
        res.send({data: [], meta: { msg: '请求参数错误', status: 404 }})
        return
    }
    let result = []
    if (Number(type) !== 3) {
        // 图片视频
        result = await MaterialDB.getUserMaterial(user_id, type, start, limit)
    } else {
        // 收藏
        const collect = await MaterialDB.getUserCollect(user_id, start, limit)
        if (collect === 500) {
            res.send({data: [], meta: { msg: '数据库查询失败', status: 500 }})
            return
        }
        const idArr = collect.map((v: any) => v.scene_id)
        result = await MaterialDB.getArrUserMaterial(idArr)
        result.forEach((item: any, index: number) => {
            const i = collect.findIndex((v: any) => v.user_id == item.user_id)
            if (i !== -1) {
                item.up_time = collect[i].like_time
            }
        })
    }
    if (result == 500) {
        res.send({data: [], meta: { msg: '数据库查询失败', status: 500 }})
        return
    }
    const userArr = result.map((v: any) => v.user_id)
    // 使用素材信息查询用户信息
    const userMsg = await UserDB.userArrMsg(userArr)
    if (userMsg == 500) {
        res.send({data: [], meta: { msg: '数据库查询失败', status: 500 }})
        return
    }
    // 获取素材的素材的点赞、收藏、评论数量
    const materiaIdArr = result.map((v: any) => v.id)
    const statistics = await MaterialDB.getMaterialSum(materiaIdArr)
    if (statistics === 500) {
        res.send({data: [], meta: { msg: '数据库查询失败', status: 500 }})
        return
    }
    result.forEach((element:any) => {
        element.likeSum = 0
        element.collectSum = 0
        element.commentSum = 0
        element.userMsg = {}
        const i = userMsg.findIndex((v: any) => v.id == element.user_id)
        if (i !== -1) {
            element.userMsg = {
                id: userMsg[i].id,
                user_image: userMsg[i].user_image,
                user_name: userMsg[i].user_name,
                phone: userMsg[i].phone,
                sex: userMsg[i].sex,
                region: userMsg[i].region,
                signature: userMsg[i].signature,
                user_type: userMsg[i].user_type,
            }
        }
        // 点赞
        const likeIndex = statistics.like.findIndex((v: any) => v.scene_id === element.id)
        if (likeIndex !== -1) {
            element.likeSum = statistics.like[likeIndex]['COUNT(scene_id)']
        }
        // 收藏
        const collectIndex = statistics.collect.findIndex((v: any) => v.scene_id === element.id)
        if (collectIndex !== -1) {
            element.collectSum = statistics.collect[collectIndex]['COUNT(scene_id)']
        }
        // 评论
        const commentIndex = statistics.comment.findIndex((v: any) => v.scene_id === element.id)
        if (commentIndex !== -1) {
            element.commentSum = statistics.comment[commentIndex]['COUNT(scene_id)']
        }
    })
    res.send({data: result, meta: { msg: '获取成功', status: 200 }})
}

module.exports ={
    usermaterial
}