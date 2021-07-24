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
        let sql = `INSERT ignore INTO scene_tag_relation (scene_id, tag_id, tag_name) VALUES `
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
        let sql = `SELECT * FROM scene_tag_category WHERE `
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
    },
    // 关键词模糊查找标签映射素材
    async querymaterialTag (arr: Array<string>) {
        if (arr.length == 0) {
            return []
        }
        let sql = `SELECT * FROM scene_tag_relation WHERE `
        arr.forEach((item: any, index: number) => {
            if (index == arr.length - 1) {
                sql += `tag_name LIKE '%${item}%'`
            } else {
                sql += `tag_name LIKE '%${item}%' OR `
            }
        })
        const result = await SySqlConnect(sql)
        if (result === undefined) {
            return 500
        }
        return result
    },
    // 写入关键词到数据库
    async setKeyword(queryArr: Array<string>, user_id: number) {
        const time = new Date().getTime()
        let sql = `INSERT INTO user_keyword (keyword, user_id, time) VALUES `
        if (queryArr.length == 0) {
            return true
        }
        queryArr.forEach((item: any, index: number) => {
            if (index == queryArr.length - 1) {
                sql += `("${item.trim()}", ${user_id}, ${time})`
            } else {
                sql += `("${item.trim()}", ${user_id}, ${time}),`
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
    // 查找关键字的数量
    async getHotSearch(start: number = 1, limit: number = 8, query: string = '') {
        const pageSize = start != undefined || limit != undefined ? (start - 1) * limit : 1
        const sql = `SELECT keyword, count(1) AS counts FROM user_keyword WHERE keyword LIKE '%${query}%' GROUP BY keyword ORDER BY counts DESC LIMIT ${pageSize},${limit}`
        const result = await SySqlConnect(sql)
        if (result === undefined) {
            return 500
        }
        return result
    },
    // 查询素材的标签
    async querySceneTag (sceneArr: Array<number>) {
        if (sceneArr.length == 0) {
            return []
        }
        const sql = `SELECT * FROM scene_tag_relation WHERE scene_id IN (${sceneArr})`
        const result = await SySqlConnect(sql)
        if (result === undefined) {
            return 500
        }
        return result
    },
    // 标签名查询
    async queryTagName (name: string) {
        const sql = `SELECT * FROM scene_tag_category WHERE name = ?`
        const SqlArr = [name]
        const result = await SySqlConnect(sql, SqlArr)
        if (result === undefined) {
            return 500
        }
        return result
    },
    // 添加标签
    async addtagName (name: string) {
        const sql = `INSERT INTO scene_tag_category (name) VALUES (?)`
        const SqlArr = [name]
        const result = await SySqlConnect(sql, SqlArr)
        if (result === undefined) {
            return 500
        } else if(result.affectedRows === 0) {
            return false
        }
        return true
    },
    // 删除标签
    async deletetag (id: number) {
        const sql = `DELETE FROM scene_tag_category WHERE id = ${id}`
        const result = await SySqlConnect(sql)
        if (result === undefined) {
            return 500
        } else if(result.affectedRows === 0) {
            return false
        }
        return true
    },
    // 删除搜索关键词
    async deleteKeyword(keyword: string) {
        const sql = `DELETE FROM user_keyword WHERE keyword = "${keyword}"`
        const result = await SySqlConnect(sql)
        if (result === undefined) {
            return 500
        } else if(result.affectedRows === 0) {
            return false
        }
        return true
    },
    // 获取关键词
    async getSearchList(start: number = 1, limit: number = 8, query: string = '') {
        const pageSize = start != undefined || limit != undefined ? (start - 1) * limit : 1
        const sql = `SELECT keyword, count(1) AS counts FROM user_keyword WHERE keyword LIKE '%${query}%' GROUP BY keyword ORDER BY counts DESC LIMIT ${pageSize},${limit}`
        const sql2 = `SELECT keyword, count(1) AS counts FROM user_keyword WHERE keyword LIKE '%${query}%' GROUP BY keyword`
        const result = await SySqlConnect(sql)
        if (result === undefined) {
            return 500
        }
        const result2 = await SySqlConnect(sql2)
        if (result2 === undefined) {
            return 500
        }
        return { data: result, sum: result2.length }
    },
    // 关键词数组删除
    async deleteArrKeyword(keyword_arr: Array<string>) {
        if (keyword_arr.length == 0) {
            return false
        }
        let text = ''
        keyword_arr.forEach((item: any, index: number) => {
            if (index == keyword_arr.length - 1) {
                text += `"${item}"`
            } else {
                text += `"${item}",`
            }
        })
        const sql = `DELETE FROM user_keyword WHERE keyword IN (${text})`
        const result = await SySqlConnect(sql)
        if (result === undefined) {
            return 500
        } else if(result.affectedRows === 0) {
            return false
        }
        return true
    },
    // 修改关键词
    async setUserKeyword(newKeyword: string ,keyword: string) {
        const sql =  `UPDATE user_keyword SET keyword = ? WHERE keyword = ?`
        const sqlArr = [String(newKeyword), String(keyword)]
        const result = await SySqlConnect(sql, sqlArr)
        if (result === undefined) {
            return 500
        } else if(result.affectedRows === 0) {
            return false
        }
        return true
    },
    // 标签下对应的素材id
    async adminQuerySceneId(string: string) {
        let sql = `SELECT * FROM scene_tag_relation WHERE tag_name LIKE '%${string}%'`
        const result = await SySqlConnect(sql)
        if (result === undefined) {
            return 500
        }
        return result
    },
    // 删除素材的映射标签
    async deleteSceneTag(id: number) {
        const sql = `DELETE FROM scene_tag_relation WHERE id = ${id}`
        const result = await SySqlConnect(sql)
        if (result === undefined) {
            return 500
        } else if(result.affectedRows === 0) {
            return false
        }
        return true
    },
    // 获取标签
    async queryAndGetTag (string: string) {
        let sql = ''
        if (string == undefined || string == '' || string == null) {
            sql = `SELECT * FROM scene_tag_category`
        } else {
            sql = `SELECT * FROM scene_tag_category WHERE name LIKE '%${string}%'`
        }
        const result = await SySqlConnect(sql)
        if (result === undefined) {
            return 500
        }
        return result
    },
    // 删除素材所有标签
    async deleteSceneAllTag (scene_id: number) {
        const sql = `DELETE FROM scene_tag_relation WHERE scene_id = ${scene_id}`
        const result = await SySqlConnect(sql)
        if (result === undefined) {
            return false
        }
        return true
    }
}