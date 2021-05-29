const { SySqlConnect } = require('../util/mysqlConfig')

module.exports = {
    // 手机号查询用户信息
    async getUserPhone (phone: number) {
        const sql = `SELECT * FROM users WHERE phone = ?`
        const sqlArr = [phone]
        const result = await SySqlConnect(sql, sqlArr)
        if (result === undefined) {
            return 500
        }
        return result
    },
    // 添加用户
    async setUser(phone: number, password: string) {
        const time = new Date().getTime()
        const sql = `INSERT INTO users (phone, creat_time, password, login_information, user_type) VALUES (?,?,?,?,?)`
        const sqlArr = [phone, time, password, time, 0]
        const result = await SySqlConnect(sql, sqlArr)
        if (result === undefined) {
            return 500
        } else if(result.affectedRows === 0) {
            return false
        }
        return result.insertId
    },
    // 用户id查询用户
    async getIdUserMsg(id: number) {
        const sql = `SELECT * FROM users WHERE id = ?`
        const sqlArr = [id]
        const result = await SySqlConnect(sql, sqlArr)
        if (result === undefined) {
            return 500
        }
        return result
    }
}