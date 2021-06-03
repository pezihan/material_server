var { SySqlConnect } = require('../util/mysqlConfig')

module.exports = {
    // 获取图片或视频素材
    async getUserMaterial (user_id: number, type: number, start: number, limit: number):Promise<number | Array<object>> {
        const pageSize = start != undefined || limit != undefined ? (start - 1) * limit : 1
        const sql = `SELECT * FROM material WHERE user_id = ? AND type = ? ORDER BY up_time DESC LIMIT ${pageSize},${limit}`
        const sqlArr = [user_id, type]
        const result = await SySqlConnect(sql, sqlArr)
        if (result === undefined) {
            return 500
        }
        return result
    },
    // 查询被收藏的素材
    async getUserCollect(user_id: number, start: number, limit: number):Promise<number | Array<object>> {
        const pageSize = start != undefined || limit != undefined ? (start - 1) * limit : 1
        const sql = `SELECT * FROM material_list_amount WHERE user_id = ? ORDER BY like_time DESC LIMIT ${pageSize},${limit}`
        const sqlArr = [user_id]
        const result = await SySqlConnect(sql, sqlArr)
        if (result === undefined) {
            return 500
        }
        return result
    },
    // 素材id查询素材
    async getArrUserMaterial (arr: Array<number>):Promise<number | Array<object>>  {
        if (arr.length === 0) {
            return []
        }
        const sql = `SELECT * FROM material WHERE id IN (${arr})`
        const result = await SySqlConnect(sql)
        if (result === undefined) {
            return 500
        }
        return result
    },
    // 查询素材的点赞、收藏、评论数量
    async getMaterialSum(materiaIdArr: Array<number>):Promise<number | object> {
        if (materiaIdArr.length === 0) {
            return {
                like: [],
                collect: [],
                comment: []
            }
        }
        let sql1 = ``
        let sql2 = ``
        let sql3 = ``
        // 点赞
        materiaIdArr.forEach((item, index) => {
            if (index !== materiaIdArr.length - 1) {
                sql1 += `SELECT scene_id,COUNT(scene_id) FROM material_list_amount WHERE scene_id = ${item} AND type = 1 UNION ALL `
                sql2 += `SELECT scene_id,COUNT(scene_id) FROM material_list_amount WHERE scene_id = ${item} AND type = 2 UNION ALL `
                sql3 += `SELECT scene_id,COUNT(scene_id) FROM user_one_comment WHERE scene_id = ${item} UNION ALL `
            } else {
                sql1 += `SELECT scene_id,COUNT(scene_id) FROM material_list_amount WHERE scene_id = ${item} AND type = 1`
                sql2 += `SELECT scene_id,COUNT(scene_id) FROM material_list_amount WHERE scene_id = ${item} AND type = 2`
                sql3 += `SELECT scene_id,COUNT(scene_id) FROM user_one_comment WHERE scene_id = ${item}`
            }
        })
        const result1 = await SySqlConnect(sql1)
        if (result1 === undefined) {
            return 500
        }
        const result2 = await SySqlConnect(sql2)
        if (result2 === undefined) {
            return 500
        }
        const result3 = await SySqlConnect(sql3)
        if (result3 === undefined) {
            return 500
        }
        return {
            like: result1,
            collect: result2,
            comment: result3
        }
    },
    // 获取分类标签
    async getTag ():Promise<Array<object> | number> {
        const sql = `SELECT * FROM scene_tag_category`
        const result = await SySqlConnect(sql)
        if (result === undefined) {
            return 500
        }
        return result
    },
    // 添加素材
    async setUserMaterial(user_id: number, phone_path: string, video_path: string, md5: string, type: number, scene_desc: string = '') {
        const up_time = new Date().getTime()
        const state = 1
        const sql = `INSERT INTO material (user_id, phone_path, video_path, md5, scene_desc, state, up_time, type) VALUES (?,?,?,?,?,?,?,?)`
        const sqlArr = [user_id, phone_path, video_path, md5, scene_desc, state, up_time, type]
        const result = await SySqlConnect(sql, sqlArr)
        if (result === undefined) {
            return 500
        } else if(result.affectedRows === 0) {
            return false
        }
        return result.insertId
    }
}