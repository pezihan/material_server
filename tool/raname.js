const mysql = require('mysql')
const exec = require('child_process').exec;
let filePath = require('../file_path_config.json')
const path = require('path')
const fs = require('fs')

let pool = mysql.createPool({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '123456',
    database: 'material'
})

function SySqlConnect(sql, sqlArr){
    return new Promise((resolve,reject)=> {
        pool.getConnection((err,conn) => {
            if(err) {
                // 数据库连接失败
                console.log(`${new Date().toLocaleString()} - `, err);
                reject(err)
            }else {
                // 事件驱动回调
                conn.query(sql,sqlArr,(err,data)=> {
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

let scenelIst = []
let index = 0

start()

async function start () {
    const sql = `SELECT * FROM material`
    const result = await SySqlConnect(sql)
    if (result === undefined) {
        return console.log('素材数据获取失败');
    } else if (result.length == 0) {
        return console.log('获取为空，准备退出');
    }
    scenelIst = result
    index = 0
    jietu(index)
}

// async function jietu (index) {
//     if (index == scenelIst.length) return console.log('已全部完成');
//     const data = scenelIst[index]
//     if (data.phone_path.lastIndexOf('.') != -1) {
//         data.phone_path = data.phone_path.substring(0, data.phone_path.lastIndexOf('.'))
//     }
//     if (data.video_path.lastIndexOf('.') != -1) {
//         data.video_path = data.video_path.substring(0, data.video_path.lastIndexOf('.'))
//     }
//     // 保存到数据库
//     const sql =  `UPDATE material SET phone_path = "${data.phone_path}", video_path = "${data.video_path}" WHERE id = ${data.id}`
//     const mysqlRes = await SySqlConnect(sql)
//     if (mysqlRes === undefined) {
//         return console.log('保存失败', videoPath);
//     }
//     index++
//     jietu(index)
//     console.log(data.id, '修改完成')
// }

async function jietu (index) {
    if (index == scenelIst.length) return console.log('已全部完成');
    const data = scenelIst[index]
    if (data.phone_path.lastIndexOf('.') == -1) {
        data.phone_path = data.phone_path + '.jpeg'
    }
    if (data.video_path.lastIndexOf('.') == -1) {
        data.video_path = data.video_path + '.mp4'
    }
    // 保存到数据库
    const sql =  `UPDATE material SET phone_path = "${data.phone_path}", video_path = "${data.video_path}" WHERE id = ${data.id}`
    const mysqlRes = await SySqlConnect(sql)
    if (mysqlRes === undefined) {
        return console.log('保存失败', videoPath);
    }
    index++
    jietu(index)
    console.log(data.id, '修改完成')
}
