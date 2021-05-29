const mysql = require('mysql')
const { mysqlKey:key } = require('./Key')

let pool:any = mysql.createPool(key)

module.exports = {
    // 链接数据库，使用mysql的连接池链接方式
    // 链接池的对象
    SySqlConnect:function(sql: string, sqlArr: Array<number | string>){
        return new Promise((resolve,reject)=> {
            pool.getConnection((err:object,conn:any) => {
                if(err) {
                    // 数据库连接失败
                    console.log(`${new Date().toLocaleString()} - `, err);
                    reject(err)
                }else {
                    // 事件驱动回调
                    conn.query(sql,sqlArr,(err: object,data: object)=> {
                        if(err) {
                            reject(err)
                        } else {
                            resolve(data)
                        }
                    });
                    // 释放链接
                    conn.release();
                }
            })
        }).catch((err)=> {
            console.log(err);
        })
    }
}