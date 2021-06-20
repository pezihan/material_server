// 载入模块
var Segment = require('node-segment').Segment;
// 创建实例
var segment = new Segment();
// 使用默认的识别模块及字典
segment.useDefault();
var TagDB = require('../modules/TagDB')

module.exports = {
    // 分词
    async participle (scene_id: number, str: string) {
        const tagText = String(str)
        let newTagText = ''
        for(let i = 0; i <= tagText.length;i++) {
            if(/^[\u4e00-\u9fa5]{0,}$/.test(tagText[i])) {
                newTagText += tagText[i]
            }
        }
        let jiebaTagTextArr = segment.doSegment(newTagText).map((v: any) => v.w)
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