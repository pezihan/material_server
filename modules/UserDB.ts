var { SySqlConnect } = require('../util/mysqlConfig')

module.exports = {
    // 手机号查询用户信息
    async getUserPhone (phone: number):Promise<number | Array<object>> {
        const sql = `SELECT * FROM users WHERE phone = ?`
        const sqlArr = [phone]
        const result = await SySqlConnect(sql, sqlArr)
        if (result === undefined) {
            return 500
        }
        return result
    },
    // 添加用户
    async setUser(phone: number, password: string, user_image: string):Promise<number | boolean> {
        const time = new Date().getTime()
        const sql = `INSERT INTO users (phone, creat_time, password, login_information, user_type, user_image) VALUES (?,?,?,?,?,?)`
        const sqlArr = [phone, time, password, time, 0, user_image]
        const result = await SySqlConnect(sql, sqlArr)
        if (result === undefined) {
            return 500
        } else if(result.affectedRows === 0) {
            return false
        }
        return result.insertId
    },
    // 用户id查询用户
    async getIdUserMsg(id: number):Promise<number | Array<object>> {
        const sql = `SELECT * FROM users WHERE id = ?`
        const sqlArr = [id]
        const result = await SySqlConnect(sql, sqlArr)
        if (result === undefined) {
            return 500
        }
        return result
    },
    // 用户粉丝与关注获取
    async userAttention(user_id:number, status: number = 1, start: number = 1, limit: number = 1):Promise<number | object | undefined> {
        const pageSize = start != undefined || limit != undefined ? (start - 1) * limit : 1
        const sql1 = `SELECT SUM(hold_id=${user_id}),SUM(user_id=${user_id}) FROM user_hold`
        const result = await SySqlConnect(sql1)
        if (result === undefined) {
            return 500
        }
        if (status === 1) {  // 数量
            return { sum:{ fans: result[0][`SUM(hold_id=${user_id})`], hold: result[0][`SUM(user_id=${user_id})`] }, data: [] };
        } else if (status === 2){  // 关注
            const sql2 = `SELECT * FROM user_hold WHERE user_id=${user_id} ORDER BY hold_time  DESC LIMIT ${pageSize},${limit}`
            const result2 = await SySqlConnect(sql2)
            if (result2 === undefined) {
                return 500
            }
            return { sum:{ fans: result[0][`SUM(hold_id=${user_id})`], hold: result[0][`SUM(user_id=${user_id})`] }, data: result2 };
        } else {    // 粉丝
            const sql3 = `SELECT * FROM user_hold WHERE hold_id=${user_id} ORDER BY hold_time  DESC LIMIT ${pageSize},${limit}`
            const result3 = await SySqlConnect(sql3)
            if (result3 === undefined) {
                return 500
            }
            return { sum:{ fans: result[0][`SUM(hold_id=${user_id})`], hold: result[0][`SUM(user_id=${user_id})`] }, data: result3 };
        }
    },
    // 修改用户信息
    async setUserMsg(user_id: number, user_image: string,  user_name: string, sex: number, region: string, signature: string):Promise<number | boolean> {
        const sql = `UPDATE users SET user_image = ?, user_name = ?, sex = ?, region = ?, signature = ? WHERE id = ?`
        const sqlArr = [user_image, user_name, sex, region, signature, user_id]
        const result = await SySqlConnect(sql, sqlArr)
        if (result === undefined) {
            return 500
        } else if(result.affectedRows === 0) {
            return false
        }
        return true
    },
    // 修改用户背景
    async setUserBackground(user_id: number, background: string):Promise<number | boolean> {
        const sql = `UPDATE users SET background = ? WHERE id = ?`
        const sqlArr = [background, user_id]
        const result = await SySqlConnect(sql, sqlArr)
        if (result === undefined) {
            return 500
        } else if(result.affectedRows === 0) {
            return false
        }
        return true
    },
    // 用户id数组批量获取用户信息
    async userArrMsg (arr: Array<number>):Promise<Array<object> | number> {
        if (arr.length == 0) {
            return []
        }
        const sql = `SELECT * FROM users WHERE id IN (${arr})`
        const result = await SySqlConnect(sql)
        if (result === undefined) {
            return 500
        }
        return result
    },
    // 获取批量查询用户的关注与粉丝
    async userArrAttention (arr: Array<number>):Promise<object | number | undefined> {
        if (arr.length == 0) {
            return { holdSum: [], fansSum: [] }
        }
        // 查询关注数量
        let sql1 = ``
        arr.forEach((item, index) => {
            if (index !== arr.length - 1) {
                sql1 += `SELECT user_id,COUNT(user_id) FROM user_hold WHERE user_id = ${item} UNION ALL `
            } else {
                sql1 += `SELECT user_id,COUNT(user_id) FROM user_hold WHERE user_id = ${item}`
            }
        })
        const result1 = await SySqlConnect(sql1)
        if (result1 === undefined) {
            return 500
        }
        // 查询粉丝数量
        let sql2 = ``
        arr.forEach((item, index) => {
            if (index !== arr.length - 1) {
                sql2 += `SELECT hold_id,COUNT(hold_id) FROM user_hold WHERE hold_id = ${item} UNION ALL `
            } else {
                sql2 += `SELECT hold_id,COUNT(hold_id) FROM user_hold WHERE hold_id = ${item}`
            }
        })
        const result2 = await SySqlConnect(sql2)
        if (result2 === undefined) {
            return 500
        }
        return { holdSum: result1, fansSum: result2 }
    },
    // 模糊查询用户信息
    async queryUser(queryArr: Array<string>, start: number, limit: number) {
        if (queryArr.length == 0) {
            return []
        }
        const pageSize = start != undefined || limit != undefined ? (start - 1) * limit : 1
        let sql = `SELECT * FROM users WHERE `
        queryArr.forEach((item: any, index: number) => {
            if (index == queryArr.length - 1) {
                sql += `id LIKE '%${item}%' OR user_name LIKE '%${item}%' OR signature LIKE '%${item}%' ORDER BY id DESC LIMIT ${pageSize},${limit}`
            } else {
                sql += `id LIKE '%${item}%' OR user_name LIKE '%${item}%' OR signature LIKE '%${item}%' OR `
            }
        })
        const result = await SySqlConnect(sql)
        if (result === undefined) {
            return 500
        }
        return result
    },
    // 用户id查询此用户关注的某个人
    async allholdList (user_id: number, hold_id: number) {
        const sql = `SELECT * FROM user_hold WHERE user_id = ? AND hold_id= ?`
        const sqlArr = [user_id, hold_id]
        const result = await SySqlConnect(sql, sqlArr)
        if (result === undefined) {
            return 500
        }
        return result
    },
    // 添加关注数据
    async addHoldMsg(user_id: number, hold_id: number) {
        const hold_time = new Date().getTime()
        const sql = `INSERT INTO user_hold (user_id, hold_id, hold_time) VALUES (?,?,?)`
        const sqlArr = [user_id, hold_id, hold_time]
        const result = await SySqlConnect(sql, sqlArr)
        if (result === undefined) {
            return 500
        } else if(result.affectedRows === 0) {
            return false
        }
        return true
    },
    // 删除关注数据
    async removeHoldMsg (user_id: number, hold_id: number) {
        const sql =`DELETE FROM user_hold WHERE user_id = ? AND hold_id = ?`
        const sqlArr = [user_id, hold_id]
        const result = await SySqlConnect(sql, sqlArr)
        if (result === undefined) {
            return 500
        } else if(result.affectedRows === 0) {
            return false
        }
        return true
    },
    // 获取用户数量
    async adminGetUser(query:string, start: number, limit:number) {
        const pageSize = start != undefined || limit != undefined ? (start - 1) * limit : 1
        let sql = ''
        let sql2 = ``
        if (query == undefined || query == '' || query == null) {
            sql = `SELECT id,user_image,user_name,phone,creat_time,sex,region,login_information,signature,user_type,background FROM users ORDER BY id DESC LIMIT ${pageSize},${limit}`
            sql2 = `SELECT COUNT(*) FROM users`
        } else {
            sql = `SELECT id,user_image,user_name,phone,creat_time,sex,region,login_information,signature,user_type,background FROM users WHERE id Like '%${query}%' OR user_name Like '%${query}%' ORDER BY id DESC LIMIT ${pageSize},${limit}`
            sql2 = `SELECT COUNT(*) FROM users WHERE id Like '%${query}%' OR user_name Like '%${query}%'`
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
    // 添加用户
    async adminAddUser(user_image: string, user_name: string, sex: number, region: string, phone: number, password: string, signature: string) {
        const time = new Date().getTime()
        const sql = `INSERT INTO users (user_image, user_name, phone, creat_time, sex, region, password, login_information, signature, user_type) VALUES (?,?,?,?,?,?,?,?,?,?)`
        const sqlArr = [user_image, user_name, phone, time, sex, region, password, time, signature, 0]
        const result = await SySqlConnect(sql, sqlArr)
        if (result === undefined) {
            return 500
        } else if(result.affectedRows === 0) {
            return false
        }
        return true
    },
    // 修改用户信息
    async adminSetUserMsg(user_id: number,user_image: string, user_name: string, sex: number, region: string, phone: number, signature: string = '') {
        const sql = `UPDATE users SET user_image = ?, user_name = ?, sex = ?, region = ?, phone =?, signature = ? WHERE id = ?`
        const sqlArr = [user_image, user_name, sex, region, phone, signature, user_id]
        const result = await SySqlConnect(sql, sqlArr)
        if (result === undefined) {
            return 500
        } else if(result.affectedRows === 0) {
            return false
        }
        return true
    },
    // 修改用户密码
    async adminSetPassword (user_id: number, password: string) {
        const sql = `UPDATE users SET password = ? WHERE id = ?`
        const sqlArr = [password, user_id]
        const result = await SySqlConnect(sql, sqlArr)
        if (result === undefined) {
            return 500
        } else if(result.affectedRows === 0) {
            return false
        }
        return true
    },
    // 修改账户的状态
    async setUserType(user_type: number, user_id:number) {
        const sql = `UPDATE users SET user_type = ? WHERE id = ?`
        const sqlArr = [user_type, user_id]
        const result = await SySqlConnect(sql, sqlArr)
        if (result == undefined) {
            return 500
        } else if(result.affectedRows == 0) {
            return false
        }
        return true
    },
    // 删除用户
    async deleteUser(user_id: number) {
        const sql =`DELETE FROM users WHERE id = ?`
        const sqlArr = [Number(user_id)]
        const result = await SySqlConnect(sql, sqlArr)
        if (result === undefined) {
            return 500
        } else if(result.affectedRows === 0) {
            return false
        }
        return true
    }
}