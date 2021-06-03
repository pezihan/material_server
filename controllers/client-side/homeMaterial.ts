var UserDB = require('../../modules/UserDB')
var MaterialDB = require('../../modules/MaterialDB')

const classify = async (req: any, res: any) => {
    const result = await MaterialDB.getTag()
    if (result == 500) {
        res.send({data: [], meta: { msg: '服务器错误', status: 500 }})
        return
    }
    res.send({data: result,meta:{msg: '获取成功',status: 200}})
}


module.exports = {
    classify
}