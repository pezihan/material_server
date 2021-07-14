var { SySqlConnect } = require('../util/mysqlConfig')

module.exports = {
    // 获取图片或视频素材
    async getUserMaterial (user_id: number, type: number, start: number, limit: number, state: number = 1):Promise<number | Array<object>> {
        const pageSize = start != undefined || limit != undefined ? (start - 1) * limit : 1
        let state_text = `state = 1`
        if (state != 1) {
            state_text = ""
        }
        const sql = `SELECT * FROM material WHERE user_id = ? AND type = ? AND ${state_text} ORDER BY up_time DESC LIMIT ${pageSize},${limit}`
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
    // 素材id数组查询素材
    async getArrUserMaterial (arr: Array<number>):Promise<number | Array<object>>  {
        if (arr.length === 0) {
            return []
        }
        const sql = `SELECT * FROM material WHERE id IN (${arr}) AND state = 1 AND user_id NOT IN (SELECT id FROM users WHERE user_type = 1)`
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
    },
    // 获取素材 （推荐）筛选了封号的用户
    async getAllMateria(type: number, start: number, limit: number):Promise<number | Array<object>> {
        const pageSize = start != undefined || limit != undefined ? (start - 1) * limit : 1
        const sql = Number(type) === 3 ? 
        `SELECT * FROM material WHERE state = 1 AND user_id NOT IN (SELECT id FROM users WHERE user_type = 1) ORDER BY up_time DESC LIMIT ${pageSize},${limit}`:
        `SELECT * FROM material WHERE type = ${type} AND state = 1 AND user_id NOT IN (SELECT id FROM users WHERE user_type = 1) ORDER BY up_time DESC LIMIT ${pageSize},${limit}`;
        const result = await SySqlConnect(sql)
        if (result === undefined) {
            return 500
        }
        return result
    },
    // 素材id数组批量获取
    async queryMateria(Arr: Array<number>, type: number, start: number, limit: number) {
        if (Arr.length == 0) {
            return []
        }
        const pageSize = start != undefined || limit != undefined ? (start - 1) * limit : 1
        const sql = Number(type) === 3 ? 
        `SELECT * FROM material WHERE user_id NOT IN (SELECT id FROM users WHERE user_type = 1) AND id IN (${Arr}) AND state = 1 ORDER BY up_time DESC LIMIT ${pageSize},${limit}`:
        `SELECT * FROM material WHERE type = ${type} AND user_id NOT IN (SELECT id FROM users WHERE user_type = 1) AND id IN (${Arr}) AND state = 1 ORDER BY up_time DESC LIMIT ${pageSize},${limit}`;
        const result = await SySqlConnect(sql)
        if (result === undefined) {
            return 500
        }
        return result
    },
    // 查询一个用户所有的点赞与收藏
    async queryLikeList (user_id: number) {
        const sql = `SELECT * FROM material_list_amount WHERE user_id = ${user_id}`
        const result = await SySqlConnect(sql)
        if (result === undefined) {
            return 500
        }
        return result
    },
    // 查询某个用户是否点赞或收藏
    async queryLikeCollet(user_id: number, scene_id: number, type: number) {
        const sql = `SELECT * FROM material_list_amount WHERE user_id = ? AND scene_id = ? AND type = ?`
        const sqlArr = [user_id, scene_id, type]
        const result = await SySqlConnect(sql, sqlArr)
        if (result === undefined) {
            return 500
        }
        return result
    },
    // 添加点赞或收藏记录
    async addRecord (user_id: number, scene_id: number, receive_id: number, type: number) {
        const like_time = new Date().getTime()
        const sql = `INSERT INTO material_list_amount (user_id, scene_id, receive_id, like_time, type) VALUES (?,?,?,?,?)`
        const sqlArr = [user_id, scene_id, receive_id, like_time, type]
        const result = await SySqlConnect(sql, sqlArr)
        if (result === undefined) {
            return 500
        } else if(result.affectedRows === 0) {
            return false
        }
        return true
    },
    // 移除收藏点赞记录
    async removeRecord(user_id: number, scene_id: number, type: number) {
        const sql =`DELETE FROM material_list_amount WHERE user_id = ? AND scene_id = ? AND type = ?`
        const sqlArr = [user_id, scene_id, type]
        const result = await SySqlConnect(sql, sqlArr)
        if (result === undefined) {
            return 500
        } else if(result.affectedRows === 0) {
            return false
        }
        return true
    },
    // 修改素材为删除状态
    async deleteUserMaterial(user_id: number, scene_id: number) {
        const sql =  `UPDATE material SET state = 2 WHERE user_id = ? AND id = ?`
        const sqlArr = [user_id, Number(scene_id)]
        const result = await SySqlConnect(sql, sqlArr)
        if (result === undefined) {
            return 500
        } else if(result.affectedRows === 0) {
            return false
        }
        return true
    },
    // 获取用户作品数量
    async adminUserMaterialSum(userArr: Array<number>) {
        if (userArr.length === 0) {
            return {
                images: [],
                video: []
            }
        }
        let sql1 = ``
        let sql2 = ``
        // 点赞
        userArr.forEach((item, index) => {
            if (index !== userArr.length - 1) {
                sql1 += `SELECT user_id,COUNT(user_id) FROM material WHERE user_id = ${item} AND type = 1 UNION ALL `
                sql2 += `SELECT user_id,COUNT(user_id) FROM material WHERE user_id = ${item} AND type = 2 UNION ALL `
            } else {
                sql1 += `SELECT user_id,COUNT(user_id) FROM material WHERE user_id = ${item} AND type = 1`
                sql2 += `SELECT user_id,COUNT(user_id) FROM material WHERE user_id = ${item} AND type = 2`
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
        return {
            images: result1,
            video: result2
        }
    },
    // 修改某个用户的所有素材为删除状态
    async deleteSceneUser(user_id: number) {
        const sql =  `UPDATE material SET state = 2 WHERE user_id = ?`
        const sqlArr = [user_id]
        const result = await SySqlConnect(sql, sqlArr)
        if (result === undefined) {
            return 500
        } else if(result.affectedRows === 0) {
            return false
        }
        return true
    },
    // 查找素材素材
    async adminQueryMateriaList(query: string = '', type: number, start: number, limit: number, sort: number | string) {
        const pageSize = start != undefined || limit != undefined ? (start - 1) * limit : 1
        const sortStr = sort == '' || sort == null || sort == undefined || sort == 0 ? `` : `AND type = ${sort} `
        // 1 素材id、 2 用户id、 3 md5  5 已删除
        let sql1,sql2;
        if (query == '' && type != 5 || query == null && type != 5 || query == undefined && type != 5) {
            sql1 = `SELECT * FROM material WHERE state = 1 ${sortStr} ORDER BY up_time DESC LIMIT ${pageSize},${limit}`
            sql2 = `SELECT COUNT(*) FROM material WHERE state = 1 ${sortStr}`
        } else if (type == 1) {
            sql1 = `SELECT * FROM material WHERE state = 1 AND id = '${query}' ${sortStr} ORDER BY up_time DESC LIMIT ${pageSize},${limit}`
            sql2 = `SELECT COUNT(*) FROM material WHERE state = 1 AND id = '${query}' ${sortStr}`
        } else if (type == 2) {
            sql1 = `SELECT * FROM material WHERE state = 1 AND user_id = '${query}' ${sortStr} ORDER BY up_time DESC LIMIT ${pageSize},${limit}`
            sql2 = `SELECT COUNT(*) FROM material WHERE state = 1 AND user_id = '${query}' ${sortStr}`
        } else if (type == 3) {
            sql1 = `SELECT * FROM material WHERE state = 1 AND md5 LIKE '%${query}%' ${sortStr} ORDER BY up_time DESC LIMIT ${pageSize},${limit}`
            sql2 = `SELECT COUNT(*) FROM material WHERE state = 1 AND md5 LIKE '%${query}%' ${sortStr}`
        } else if (type == 5) {
            sql1 = `SELECT * FROM material WHERE state = 2 AND id = '${query}' ${sortStr} OR state = 2 AND user_id = '${query}' ${sortStr} OR state = 2 AND md5 LIKE '%${query}%' ${sortStr} OR state = 2 AND scene_desc LIKE '%${query}%' ${sortStr} ORDER BY up_time DESC LIMIT ${pageSize},${limit}`
            sql2 = `SELECT COUNT(*) FROM material WHERE state = 2 AND id = '${query}' ${sortStr} OR state = 2 AND user_id = '${query}' ${sortStr} OR state = 2 AND md5 LIKE '%${query}%' ${sortStr} OR state = 2 AND scene_desc LIKE '%${query}%' ${sortStr}`
        }
        const result1 = await SySqlConnect(sql1)
        if (result1 === undefined) {
            return 500
        }
        const result2 = await SySqlConnect(sql2)
        if (result2 === undefined) {
            return 500
        }
        return { data: result1, sum: result2[0]['COUNT(*)'] }
    },
    // 素材id获取素材信息
    async adminGetSceneList(IdArr: Array<number>, start: number, limit: number, sort: number | string) {
        if (IdArr.length == 0) {
            return { data: [], sum: 0 }
        }
        const sortStr = sort == '' || sort == null || sort == undefined || sort == 0 ? `` : `AND type = ${sort} `
        const pageSize = start != undefined || limit != undefined ? (start - 1) * limit : 1
        const sql1 = `SELECT * FROM material WHERE id IN (${IdArr}) AND state = 1 ${sortStr} ORDER BY up_time DESC LIMIT ${pageSize},${limit}`
        const sql2 = `SELECT COUNT(*) FROM material WHERE id IN (${IdArr}) AND state = 1 ${sortStr}`
        const result1 = await SySqlConnect(sql1)
        if (result1 === undefined) {
            return 500
        }
        const result2 = await SySqlConnect(sql2)
        if (result2 === undefined) {
            return 500
        }
        return { data: result1, sum: result2[0]['COUNT(*)'] }
    },
    // 素材id数组批量删除
    async adminAllmaterial(scene_id_arr: Array<number>) {
        const sql =  `UPDATE material SET state = 2 WHERE id IN (${scene_id_arr})`
        const result = await SySqlConnect(sql)
        if (result === undefined) {
            return 500
        } else if(result.affectedRows === 0) {
            return false
        }
        return true
    },
    // 修改素材状态
    async SetUserMaterialState(state: number, scene_id: number) {
        const sql =  `UPDATE material SET state = ? WHERE id = ?`
        const sqlArr = [state, Number(scene_id)]
        const result = await SySqlConnect(sql, sqlArr)
        if (result === undefined) {
            return 500
        } else if(result.affectedRows === 0) {
            return false
        }
        return true
    },
    // admin爬取图片素材保存
    async adminSetUserMaterial(user_id: number, phone_path: string, video_path: string, md5: string, type: number, scene_desc: string = '', id: number) {
        const up_time = new Date().getTime()
        const state = 1
        const sql = `INSERT INTO material (user_id, phone_path, video_path, md5, scene_desc, state, up_time, type, id) VALUES (?,?,?,?,?,?,?,?,?)`
        const sqlArr = [user_id, phone_path, video_path, md5, scene_desc, state, up_time, type, id]
        const result = await SySqlConnect(sql, sqlArr)
        if (result === undefined) {
            return 500
        } else if(result.affectedRows === 0) {
            return false
        }
        return result.insertId
    },
    // 查询快手爬取的视频是否存在
    async getVideoUserMaterial (ks_id: string) {
        const sql = `SELECT * FROM material WHERE ks_id = "${ks_id}"`
        const result = await SySqlConnect(sql)
        if (result === undefined) {
            return 500
        }
        return result
    },
     // admin爬取视频素材保存
    async adminSetVideoMaterial(user_id: number, phone_path: string, video_path: string, md5: string, type: number, scene_desc: string = '', ks_id: string) {
        const up_time = new Date().getTime()
        const state = 1
        const sql = `INSERT INTO material (user_id, phone_path, video_path, md5, scene_desc, state, up_time, type, ks_id) VALUES (?,?,?,?,?,?,?,?,?)`
        const sqlArr = [user_id, phone_path, video_path, md5, scene_desc, state, up_time, type, ks_id]
        const result = await SySqlConnect(sql, sqlArr)
        if (result === undefined) {
            return 500
        } else if(result.affectedRows === 0) {
            return false
        }
        return result.insertId
    },
    // 搜索素材
    async searchTextScene(type: number, start: number, limit: number, query: string) {
        const pageSize = start != undefined || limit != undefined ? (start - 1) * limit : 1
        const sql = Number(type) === 3 ? 
        `SELECT * FROM material WHERE user_id NOT IN (SELECT id FROM users WHERE user_type = 1) AND scene_desc LIKE '%${query}%' AND state = 1 ORDER BY up_time DESC LIMIT ${pageSize},${limit}`:
        `SELECT * FROM material WHERE type = ${type} AND user_id NOT IN (SELECT id FROM users WHERE user_type = 1) AND scene_desc LIKE '%${query}%' AND state = 1 ORDER BY up_time DESC LIMIT ${pageSize},${limit}`;
        const result = await SySqlConnect(sql)
        if (result === undefined) {
            return 500
        }
        return result
    },
    // 修改素材的用户所属
    async setMateriaUser(scene_Arr: Array<number>, user_id: number) {
        if (scene_Arr.length == 0) {
            return 500
        }
        const sql =  `UPDATE material SET user_id = ${user_id} WHERE id IN (${scene_Arr})`
        const result = await SySqlConnect(sql)
        if (result === undefined) {
            return 500
        } else if(result.affectedRows === 0) {
            return false
        }
        return true
    },
    // 批量模糊查询用户文案
    async participleQuery(textArr: Array<string>, scene_id: number,start: number, limit: number) {
        const pageSize = start != undefined || limit != undefined ? (start - 1) * limit : 1
        if (textArr.length == 0) {
            return []
        }
        let sqlText = ''
        textArr.forEach((item, index) => {
            if (index === 0) {
                sqlText += `scene_desc LIKE ('%${item}%') AND state = 1 AND id != ${scene_id} `
            } else {
                sqlText += `OR scene_desc LIKE ('%${item}%') AND state = 1 AND id != ${scene_id} `
            }
        })
        const sql = `SELECT * FROM material WHERE ${sqlText} ORDER BY up_time DESC LIMIT ${pageSize},${limit}`
        const result = await SySqlConnect(sql)
        if (result === undefined) {
            return 500
        }
        return result
    }
}