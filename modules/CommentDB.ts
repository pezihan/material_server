var { SySqlConnect } = require('../util/mysqlConfig')

module.exports = {
    // 添加一级评论
    async setUserComment (scene_id: number, user_id: number, comment_text: string, receive_id: number) {
        const comment_time = new Date().getTime()
        const sql = `INSERT INTO user_one_comment (scene_id, user_id, comment_text, comment_time, receive_id) VALUES (?,?,?,?,?)`
        const sqlArr = [scene_id, user_id, comment_text, comment_time, receive_id]
        const result = await SySqlConnect(sql, sqlArr)
        if (result === undefined) {
            return 500
        } else if(result.affectedRows === 0) {
            return false
        }
        return true
    },
    // 评论id查询一级评论
    async queryOneCommentMsg(comment_id: number) {
        const sql = `SELECT * FROM user_one_comment WHERE id = ${comment_id}`
        const result = await SySqlConnect(sql)
        if (result === undefined) {
            return 500
        }
        return result
    },
    // 添加二级评论
    async setUserTwoComment(comment_id: number, user_id: number, comment_text: string, receive_id: number) {
        const comment_time = new Date().getTime()
        const sql = `INSERT INTO user_two_comment (comment_id, user_id, comment_text, comment_time, receive_id) VALUES (?,?,?,?,?)`
        const sqlArr = [comment_id, user_id, comment_text, comment_time, receive_id]
        const result = await SySqlConnect(sql, sqlArr)
        if (result === undefined) {
            return 500
        } else if(result.affectedRows === 0) {
            return false
        }
        return true
    },
    // 获取一级评论
    async getOneComment (scene_id: number, start: number, limit: number) {
        const pageSize = start != undefined || limit != undefined ? (start - 1) * limit : 1
        const sql = `SELECT * FROM user_one_comment WHERE scene_id = ${scene_id} ORDER BY comment_time DESC LIMIT ${pageSize},${limit}`
        const result = await SySqlConnect(sql)
        if (result === undefined) {
            return 500
        }
        return result
    },
    // 获取二级评论
    async getTwoComment(commentArr: Array<number>) {
        if (commentArr.length == 0) {
            return []
        }
        const sql = `SELECT * FROM user_two_comment WHERE comment_id IN (${commentArr}) ORDER BY comment_time DESC`
        const result = await SySqlConnect(sql)
        if (result === undefined) {
            return 500
        }
        return result
    }
}