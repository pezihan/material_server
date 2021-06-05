var { SySqlConnect } = require('../util/mysqlConfig')

module.exports = {
    // id批量查询标签
    async getTagMsg(arr: Array<number>) {
        if (arr.length == 0) {
            return []
        }
        const sql = `SELECT * FROM scene_tag_category WHERE id IN (${arr})`
        const result = await SySqlConnect(sql)
        if (result === undefined) {
            return 500
        }
        return result
    },
    // 写入标签
    async setScnenTag (scene_id: number, arr: Array<object>) {
        let sql = `INSERT INTO scene_tag_relation (scene_id, tag_id, tag_name) VALUES `
        if (arr.length == 0) {
            return true
        }
        arr.forEach((item: any, index: number) => {
            if (index == arr.length - 1) {
                sql += `(${scene_id}, ${item.id}, '${item.name}')`
            } else {
                sql += `(${scene_id}, ${item.id}, '${item.name}'),`
            }
        })
        const result = await SySqlConnect(sql)
        if (result === undefined) {
            return 500
        } else if(result.affectedRows === 0) {
            return false
        }
        return true
    },
    // 关键词模糊查找分类标签
    async queryTag (arr: Array<string>) {
        if (arr.length == 0) {
            return []
        }
        let sql = `SELECT * FROM scene_tag_category WHERE`
        arr.forEach((item: any, index: number) => {
            if (index == arr.length - 1) {
                sql += `name LIKE '%${item}%'`
            } else {
                sql += `name LIKE '%${item}%' OR `
            }
        })
        const result = await SySqlConnect(sql)
        if (result === undefined) {
            return 500
        }
        return result
    },
    // 标签获取全部素材
    async getAllTagMateria(tag_id: number) {
        const sql = `SELECT * FROM scene_tag_relation WHERE tag_id = ${tag_id}`
        const result = await SySqlConnect(sql)
        if (result === undefined) {
            return 500
        }
        return result
    }
}