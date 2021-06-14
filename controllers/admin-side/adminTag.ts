var TagDB = require('../../modules/TagDB')
var MaterialDB = require('../../modules/MaterialDB')

// 获取所有标签
const getTag = async (req: any, res: any) => {
    const result = await MaterialDB.getTag()
    if (result == 500) {
        res.send({data: [], meta: { msg: 'Server Error', status: 500 }})
        return
    }
    res.send({data: result,meta:{msg: '获取成功',status: 200}})
}

// 添加标签
const addTag = async (req: any, res: any) => {
    const { name } = req.body
    if (name == '' || name == undefined) {
        res.send({data: [], meta: { msg: '请求参数错误', status: 403 }})
        return
    }
    // 查询是否有重复的标签
    const tagres = await TagDB.queryTagName(name)
    if (tagres == 500) {
        res.send({data: [], meta: { msg: 'Server Error', status: 500 }})
        return
    } else if (tagres.length != 0) {
        res.send({data: [], meta: { msg: '此标签已添过', status: 403 }})
        return
    }
    const result = await TagDB.addtagName(name)
    if (result == 500) {
        res.send({data: [], meta: { msg: 'Server Error', status: 500 }})
        return
    } else if (result == false) {
        res.send({data: [], meta: { msg: '添加失败', status: 400 }})
        return
    }
    res.send({data: [], meta: { msg: '添加成功', status: 201 }})
}

// 删除标签
const delTag = async (req: any, res: any) => {
    const { id } = req.query
    if (id == '' || id == undefined) {
        res.send({data: [], meta: { msg: '请求参数错误', status: 403 }})
        return
    }
    if (id == 1 || id == 2 || id == 3 || id == 4 || id == 5 || id == 6 || id == 7 || id == 8 || id == 9
        || id == 10 || id == 11 || id == 12 || id == 13 || id == 14 || id == 15 || id == 16 || id == 17 || id == 18) {
        res.send({data: [], meta: { msg: '默认标签不允许删除', status: 403 }})
        return
    }
    const result = await TagDB.deletetag(id)
    if (result == 500) {
        res.send({data: [], meta: { msg: 'Server Error', status: 500 }})
        return
    } else if (result == false) {
        res.send({data: [], meta: { msg: '删除失败', status: 400 }})
        return
    }
    res.send({data: [], meta: { msg: '删除成功', status: 201 }})
}

module.exports = {
    getTag,
    addTag,
    delTag
}