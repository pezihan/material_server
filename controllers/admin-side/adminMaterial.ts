var TagDB = require('../../modules/TagDB')
var MaterialDB = require('../../modules/MaterialDB')
var UserDB = require('../../modules/UserDB')

// 获取素材列表
const getSceneList = async (req: any, res: any) => {
    const { query, type, start, limit, sort } = req.query
    if (type == '' || type == undefined || type < 1 || type > 5 || start == '' || start == undefined ||
    start < 1 || limit == '' || limit == undefined || limit < 1) {
        res.send({data: [], meta: { msg: '请求参数错误', status: 403 }})
        return
    }
    // 1 素材id、 2 用户id、 3 md5 4素材类别  5 已删除
    let scene = []
    if (query != '' && query != undefined && query && null || type == 4) {
        const sceneArr = await TagDB.adminQuerySceneId(query)
        if (sceneArr == 500) {
            res.send({data: [], meta: { msg: 'Server error', status: 500 }})
            return
        }
        const IdArr = sceneArr.map((v: any) => v.scene_id)
        scene = await MaterialDB.adminGetSceneList(IdArr, start, limit, sort)
    } else {
        scene = await MaterialDB.adminQueryMateriaList(query, type, start, limit, sort)
    }
    if (scene == 500) {
        res.send({data: [], meta: { msg: 'Server Error', status: 500 }})
        return
    }
    const Arr = scene.data.map((v: any) => v.id)
    // 查询素材对应的标签
    const sceneTag = await TagDB.querySceneTag(Arr)
    if (sceneTag == 500) {
        res.send({data: [], meta: { msg: 'Server Error', status: 500 }})
        return
    }
    // 查询素材点赞与收藏数量
    const statistics = await MaterialDB.getMaterialSum(Arr)
    if (statistics == 500) {
        res.send({data: [], meta: { msg: 'Server Error', status: 500 }})
        return
    }
    scene.data.forEach((item: any) => {
        const index1 = sceneTag.findIndex((v: any) => v.scene_id == item.id)
        item.classify = []
        sceneTag.forEach((irem: any) => {
            if (irem.scene_id == item.id) {
                item.classify.push(irem)
            }
        })
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
    res.send({data: scene.data, meta: { msg: '获取成功', sum: scene.sum, status: 200 }})
}

// 批量删除素材
const deleteScene = async (req: any, res: any) => {
    const { scene_id_arr } = req.body
    if (scene_id_arr == '' || scene_id_arr == undefined || Array.isArray(scene_id_arr) == false)  {
        res.send({data: [], meta: { msg: '请求参数错误', status: 403 }})
        return
    }
    const result = await MaterialDB.adminAllmaterial(scene_id_arr)
    if (result == 500) {
        res.send({data: [], meta: { msg: 'Server error', status: 500 }})
        return
    } else if (result == false) {
        res.send({data: [], meta: { msg: '删除失败', status: 400 }})
        return
    }
    res.send({data: [], meta: { msg: '删除成功', status: 201 }})
}

// 修改素材状态
const scenestatus = async (req: any, res: any) => {
    const { scene_id, status } = req.body
    if (scene_id == '' || status == undefined || status == '' || status == undefined || status < 1 || status > 2) {
        res.send({data: [], meta: { msg: '请求参数错误', status: 403 }})
        return
    }
    const result = await MaterialDB.SetUserMaterialState(status, scene_id)
    if (result == 500) {
        res.send({data: [], meta: { msg: 'Server error', status: 500 }})
        return
    } else if (result == false) {
        res.send({data: [], meta: { msg: '修改失败', status: 400 }})
        return
    }
    res.send({data: [], meta: { msg: '修改成功', status: 201 }})
}

// 删除标签
const delsceneTag = async (req: any, res: any) => {
    const { id } = req.query
    if (id == '' || id == undefined) {
        res.send({data: [], meta: { msg: '请求参数错误', status: 403 }})
        return
    }
    const result = await TagDB.deleteSceneTag(id)
    if (result == 500) {
        res.send({data: [], meta: { msg: 'Server error', status: 500 }})
        return
    } else if (result == false) {
        res.send({data: [], meta: { msg: '删除失败', status: 400 }})
        return
    }
    res.send({data: [], meta: { msg: '删除成功', status: 201 }})
}

// 查询分类标签
const sceneTagSearch = async (req: any, res: any) => {
    const { query } = req.query
    const result = await TagDB.queryAndGetTag(query)
    if (result == 500) {
        res.send({data: [], meta: { msg: 'Server error', status: 500 }})
        return
    }
    res.send({data: result, meta: { msg: '获取成功', status: 200 }})
}

// 添加素材分类标签
const addSceneTags = async (req: any, res: any) => {
    const { scene_id, tagPitch } = req.body
    if (scene_id == '' || scene_id == undefined || tagPitch == '' || tagPitch == undefined || Array.isArray(tagPitch) == false) {
        res.send({data: [], meta: { msg: '请求参数错误', status: 403 }})
        return
    }
    // 查询标签信息
    const tagMsg = await TagDB.getTagMsg(tagPitch)
    if (tagMsg == 500) {
        res.send({data: [], meta: { msg: 'Server error', status: 500 }})
        return
    }
    // 查询素材所有的标签
    const allSceneTag = await TagDB.querySceneTag([scene_id])
    if (allSceneTag == 500) {
        res.send({data: [], meta: { msg: 'Server error', status: 500 }})
        return
    }
    let filterTagMsg:any = []
    tagMsg.forEach((item:any) => {
        const index = allSceneTag.findIndex((v: any)=> v.tag_id == item.id)
        if (index == -1) {
            filterTagMsg.push(item)
        }
    })
    if (filterTagMsg.length == 0) {
        res.send({data: [], meta: { msg: '已有相同的标签存在', status: 403 }})
        return
    }
    const result = await TagDB.setScnenTag(scene_id, filterTagMsg)
    if (result == 500) {
        res.send({data: [], meta: { msg: 'Server error', status: 500 }})
        return
    } else if (result == false) {
        res.send({data: [], meta: { msg: '添加失败', status: 400 }})
        return
    }
    res.send({data: [], meta: { msg: '添加成功', status: 201 }})
}

// 修改素材的所属用户
const setSceneUser = async (req: any, res: any) => {
    const { scene_Arr, user_id } = req.body
    if (scene_Arr == '' || scene_Arr == undefined || Array.isArray(scene_Arr) == false || user_id == '' || user_id == undefined) {
        res.send({data: [], meta: { msg: '请求参数错误', status: 403 }})
        return
    }
    // 查询是否有此用户
    const userRes = await UserDB.getIdUserMsg(user_id)
    if (userRes == 500) {
        res.send({data: [], meta: { msg: 'server error', status: 500 }})
        return
    } else if (userRes.length == 0) {
        res.send({data: [], meta: { msg: '此用户不存在', status: 404 }})
        return
    }
    // 修改
    const result = await MaterialDB.setMateriaUser(scene_Arr, user_id)
    if (result == 500) {
        res.send({data: [], meta: { msg: 'server error', status: 500 }})
        return
    } else if (result == false) {
        res.send({data: [], meta: { msg: '修改失败', status: 400 }})
        return
    }
    res.send({data: [], meta: { msg: '修改成功', status: 201 }})
}

module.exports = {
    getSceneList,
    deleteScene,
    scenestatus,
    delsceneTag,
    sceneTagSearch,
    addSceneTags,
    setSceneUser
}