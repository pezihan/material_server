var { SySqlConnect } = require('../util/mysqlConfig')

module.exports = {
    // 查询管理员账号信息
    async getAdminUser (username: string, password: string) {
        const sql = `SELECT * FROM admin_users WHERE username = ? AND password = ?`
        const sqlArr = [username, password]
        const result = await SySqlConnect(sql, sqlArr)
        if (result === undefined) {
            return 500
        }
        return result
    }
}