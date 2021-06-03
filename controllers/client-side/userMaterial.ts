var UserDB = require('../../modules/UserDB')
var MaterialDB = require('../../modules/MaterialDB')
var Mulet = require('../../util/multerconfig')
var TagDB = require('../../modules/TagDB')
var makeTag = require('../../lib/makeTag')

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

// 上传素材
const upMaterial = async (req: any, res: any) => {
    const userMsg = req.userMsg
    let { scene_desc, type, tag_arr } = req.query
    tag_arr = [1,2,3,4]
    scene_desc = '艺术植物生活头像'
    if (type == '' || type == undefined || type < 1 || type > 2 || Array.isArray(tag_arr) == false) {
        res.send({data: [], meta: { msg: '请求参数错误', status: 404 }})
        return
    }
    req.storagePath = type == 1 ? 'material_images' : 'material_video'
    Mulet.updateImg (req, res, async (err: any) => {
        if(!!err){
            res.send({data:{},meta:{msg: '超过服务器传输限制',status: 400}})
            return;
        }
        if(!!req.file){
            let phone_path = ''
            let video_path = ''
            let md5 = req.md5
            if (type == 1) {
                phone_path = req.filePath
            }else if (type == 2) {
                // 上传的视频
                video_path = req.filePath
            }
            // 保存到数据库
            const result = await MaterialDB.setUserMaterial(userMsg.id, phone_path, video_path, md5, type, scene_desc)
            if (result == 500) {
                res.send({data:{},meta:{msg: '上传失败',status: 500}})
                return
            } else if (result == false) {
                res.send({data:{},meta:{msg: '上传失败',status: 400}})
                return
            }
            res.send({data:{id: result},meta:{msg: '上传成功',status: 201}})
            // 查询用户传来的标签内容
            const tagMsg = await TagDB.getTagMsg(tag_arr)
            if (tagMsg == 500) {
                console.log(new Date().toLocaleString(),'分类标签查询失败');
            }
            // 将用户传过来的分类标签写入数据
            const msg = await TagDB.setScnenTag(result, tagMsg)
            if (msg == 500 || msg == false) {
                console.log(new Date().toLocaleString(),'分类标签存储失败');
            }
            // 通过文案对此素材进行分类
            if (scene_desc != '' || scene_desc != undefined) {
                makeTag.participle(result, scene_desc)
            }
        } else {
            res.send({data:{},meta:{msg: '上传文件不支持',status: 400}})
        }
    })
}

module.exports ={
    usermaterial,
    upMaterial
}