var nodejieba = require('nodejieba')
var TagDB = require('../modules/TagDB')

module.exports = {
    // 分词
    async participle (scene_id: number, str: string) {
        const tagText = str.toString()
        let newTagText = ''
        for(let i = 0; i <= tagText.length;i++) {
            if(/^[\u4e00-\u9fa5]{0,}$/.test(tagText[i])) {
                newTagText += tagText[i]
            }
        }
        let jiebaTagTextArr = nodejieba.cut(newTagText)
        // 查询标签
        const result = await TagDB.queryTag(jiebaTagTextArr)
        if (result == 500) {
            console.log('分词查询失败');
        }
        // 存入数据库的标签与素材映射
        if (result.length != 0) {
            const msg = await TagDB.setScnenTag (scene_id, result)
            if (msg == 500) {
                console.log('分词筛选分类词保存失败');
            }
        }
    }
}