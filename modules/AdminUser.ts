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
    },
    // id查询用户信息
    async getIdAdminUser (id: number) {
        const sql = `SELECT * FROM admin_users WHERE id = ?`
        const sqlArr = [id]
        const result = await SySqlConnect(sql, sqlArr)
        if (result === undefined) {
            return 500
        }
        return result
    },
    // 获取管理员账号信息
    async queryAdminUser (start: number, limit: number, query: string) {
        const pageSize = start != undefined || limit != undefined ? (start - 1) * limit : 1
        let sql = ''
        let sql2 =  ``
        if (query == undefined || query == '' || query == null) {
            sql = `SELECT * FROM admin_users ORDER BY id DESC LIMIT ${pageSize},${limit}`
            sql2 = `SELECT COUNT(*) FROM admin_users`
        } else {
            sql = `SELECT * FROM admin_users WHERE id Like '%${query}%' OR username Like '%${query}%' ORDER BY id DESC LIMIT ${pageSize},${limit}`
            sql2 = `SELECT * FROM admin_users WHERE id Like '%${query}%' OR username Like '%${query}%'`
        }
        const result = await SySqlConnect(sql)
        if (result == undefined) {
            return 500
        }
        const result2 = await SySqlConnect(sql2)
        if (result == undefined) {
            return 500
        }
        return { data: result, sum: result2[0]['COUNT(*)'] }
    },
    // 使用用户名查找
    async queryNameAdmin (username: string) {
        const sql = `SELECT * FROM admin_users WHERE username = ?`
        const sqlArr = [username]
        const result = await SySqlConnect(sql, sqlArr)
        if (result === undefined) {
            return 500
        }
        return result
    },
    // 添加用户
    async addAdminUser(username: string, password: string, status: boolean) {
        const create_time = new Date().getTime()
        const sql = `INSERT INTO admin_users (username, password, status, create_time) VALUES (?, ?, ?, ?)`
        const sqlArr = [username, password, status == true ? 2 : 1, create_time]
        const result = await SySqlConnect(sql, sqlArr)
        if (result === undefined) {
            return 500
        } else if (result.affectedRows === 0) {
            return false
        }
        return true
    },
    // 修改账号类型
    async setAdminStatus(id: number, status: number) {
        const sql =  `UPDATE admin_users SET status = ? WHERE id = ?`
        const sqlArr = [status, id]
        const result = await SySqlConnect(sql, sqlArr)
        if (result === undefined) {
            return 500
        } else if(result.affectedRows === 0) {
            return false
        }
        return true
    },
    // 查询管理账号的数量
    async getAdminSum () {
        const sql = `SELECT COUNT(*) FROM admin_users WHERE status = 2`
        const result = await SySqlConnect(sql)
        if (result === undefined) {
            return 500
        }
        return { sum: result[0]['COUNT(*)'] } 
    },
    // 修改账户密码
    async setAdminPassword(id: number, password: string) {
        const sql =  `UPDATE admin_users SET password = ? WHERE id = ?`
        const sqlArr = [password, id]
        const result = await SySqlConnect(sql, sqlArr)
        if (result === undefined) {
            return 500
        } else if(result.affectedRows === 0) {
            return false
        }
        return true
    },
    // 删除账号
    async deleteAdminPassword(id: number) {
        const sql = `DELETE FROM admin_users WHERE id = ${id}`
        const result = await SySqlConnect(sql)
        if (result === undefined) {
            return 500
        } else if(result.affectedRows === 0) {
            return false
        }
        return true
    }
}