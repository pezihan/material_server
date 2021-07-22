const mysql = require('mysql')
const exec = require('child_process').exec;
let filePath = require('../file_path_config.json')
const path = require('path')

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
    const sql = `SELECT * FROM material WHERE type = 2`
    const result = await SySqlConnect(sql)
    if (result === undefined) {
        return console.log('素材数据获取失败');
    } else if (result.length == 0) {
        return console.log('获取为空，准备退出');
    }
    scenelIst = result
    index = 0
    jietu(scenelIst[index].id, scenelIst[index].md5, scenelIst[index].video_path)
}



async function jietu (id, md5, video_path) {
    if (index == scenelIst.length) return console.log('已全部完成');
    const videoPath = '../' + filePath.path + '/material_video/' + video_path
    const imagesName = md5 + '.jpg'
    const imagePath = '../' + filePath.path + '/material_images/' + imagesName
    const result = await create(videoPath, imagePath)
    if (result == false) {
        console.log('截图失败', videoPath)
    }
    // 保存到数据库
    const sql =  `UPDATE material SET phone_path = "${imagesName}" WHERE id = ${id}`
    const mysqlRes = await SySqlConnect(sql)
    if (mysqlRes === undefined) {
        return console.log('保存失败', videoPath);
    }
    index++
    jietu(scenelIst[index].id, scenelIst[index].md5, scenelIst[index].video_path)
    console.log(id, '修改完成')
}




function create (path, fileName) {
    return new Promise(async (resolve,reject)=> {
        await exec(`ffmpeg -ss 00:00:01 -i ${path}  -frames:v 1 -y ${fileName}`, async function(error, stdout, stderr) {
            if (error) {
                console.log(error)
                resolve(false)
            }
            console.log(stdout)
            resolve(fileName)
        })
    }).catch((err)=> {
        console.log(err);
    })
}