
// 同级目录下创建data目录  data 下可以创建 其他目录作为特殊ts下载数据源  在控制台调整参数

const axios = require('axios')
const exec = require('child_process').exec;
const fs = require('fs')
const iconvLite = require('iconv-lite')
var child_process=require("child_process")
const inquirer = require('inquirer')
const nodepath = require('path')
const mysql = require('mysql')
const md5 = require('blueimp-md5')
let filePath = require('../file_path_config.json')


// @https://vip4.ddyunbo.com

// 默认存储位置
//let path = '../public/material_video' // 默认存储位置
let path = filePath.path.lastIndexOf('.') !== -1 ? '../' + filePath.path + '/material_video' : filePath.path + '/material_video'
let imagePath = filePath.path.lastIndexOf('.') !== -1 ? '../' + filePath.path + '/material_images' : filePath.path + '/material_images'
// 配置文件位置
let config = './data/'

let host = ''

let index = 0

let user_id = null


let header = {
    'user-agent' : 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
    'referer' : 'https://www.myr8ldjqw3fz4ix1edm12dch.xyz:59980/static/player/dplayer.html?v=1',
    'cookie' : 'PHPSESSID=09kp85jsn4g0glhlk4oa7pim61; UBGLAI63GV=kajhy.1620666769; __ty_cpvx_t_4504_cpv_plan_ids=%7C3%7C; __ty_cpvx_t_4504_cpv_plan_uids=%7C6%7C; __51uvsct__JHidR6xnmvB1bjy4=1; __51vcke__JHidR6xnmvB1bjy4=830f8590-6ba7-5e87-b57a-e3de223f8631; __51vuft__JHidR6xnmvB1bjy4=1620666770386; __51uvsct__JHif6c3b1pRwZtOF=1; __51vcke__JHif6c3b1pRwZtOF=782331c4-13a6-5e86-9028-1b973dee7763; __51vuft__JHif6c3b1pRwZtOF=1620666770409; Hm_lvt_b8afbcaa9ff38d6f86ebb5962ff61b14=1620666775; Hm_lpvt_b8afbcaa9ff38d6f86ebb5962ff61b14=1620666775; need_wd_lm=1; v_popped=1; v_lm_times=3; __vtins__JHidR6xnmvB1bjy4=%7B%22sid%22%3A%20%22d4bcf2ae-379f-59fc-9412-80ed49adc35f%22%2C%20%22vd%22%3A%204%2C%20%22stt%22%3A%20756337%2C%20%22dr%22%3A%208686%2C%20%22expires%22%3A%201620669326713%2C%20%22ct%22%3A%201620667526713%7D; __vtins__JHif6c3b1pRwZtOF=%7B%22sid%22%3A%20%22ef23e4f7-1ff6-5ac3-ba85-c253bd9729a2%22%2C%20%22vd%22%3A%204%2C%20%22stt%22%3A%20756342%2C%20%22dr%22%3A%208693%2C%20%22expires%22%3A%201620669326741%2C%20%22ct%22%3A%201620667526741%7D; jump_28=0; __ty_cpvx_b_9844_cpv_plan_ids=%7C164%7C%7C131%7C; __ty_cpvx_b_9844_cpv_plan_uids=%7C3582%7C%7C63%7C'
}

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




var questions = [{
    type: 'input',
    name: 'config',
    message: "请输入爬取的文件流文件路径：",
}, {
    type: 'input',
    name: 'host',
    message: "请输入爬取文件的请求域名（空的话使用将直接请求配置文件中域名）：",
}, {
    type: 'input',
    name: 'user_id',
    message: "请输入要存储到的用户id",
}]

inquirer.prompt(questions).then(async item => {
       config = item.config == '' || item.config == undefined ? config : config + item.config
       host = item.host == '' || item.host == undefined ? host: item.host
       user_id = item.user_id
       if (user_id == '') return 
       // 查询用户是否存在
        const sql = `SELECT * FROM users WHERE id = ?`
        const sqlArr = [user_id]
        const result = await SySqlConnect(sql, sqlArr)
        if (result === undefined) {
            return console.log('用户查询失败，准备退出');
        } else if (result.length == 0) {
            return console.log('用户不存在，准备退出');
        }
       // 读取文件
       fsData(config)
})

let urlArrliu = []

async function fsData(config) {
    let res=[]
    fs.readdirSync(config).forEach((file)=>{
        if (file.lastIndexOf('.m3u8') != -1) {
            res.push(file)
        }
    })
    console.log('即将下载',res);
    urlArrliu = res
    digui(urlArrliu,0)
}  

// 递归依次下载
async function digui (res, i) {
    if (i == res.length) {
        console.log('下载完成，退出程序。。。')
        return
    }
    // 读取配置文件
    fs.readFile(`${config}/${res[i].trim()}`, 'utf-8',async function (err, data) {
        if(err) {
            console.log(err)
            return
        }
        let newArr = []
        const Arr = data.split(/[(\r\n)\r\n]+/)
        const key = host == "" || host == undefined || host == null ? "http" : "/"
        Arr.forEach(item => {
            if (item.search(key) != -1) {
                newArr.push(item)
            }
        })
        if (newArr.length == 0) {
            console.log('视频列表为空');
            return
        }
        await doenload(newArr, res[i].substring(0, res[i].lastIndexOf(".")))
    })
}


// 下载视频处理
async function doenload (urlpath, title) {
    // 查询此视频是否存在数据库中
    const videoMd5 = md5(title + 2312313123123)
    var sql = `SELECT * FROM material WHERE ks_id = "${videoMd5}"`
    var result = await SySqlConnect(sql)
    if (result == undefined) {
        console.log('数据库查询失败，取消下载');
    } else if (result.length != 0) {
        console.log('视频已存在，开始下载下一条');
        index++
        digui(urlArrliu, index)
        return
    }
    let flowvideourl = urlpath // 流文件列表
    // 开始下载 创建文件夹
    try {
        fs.mkdirSync(`${path}/${title.trim()}`);
        // 创建配置文件
        let configData = { record:  ""}
        var writeStream = fs.createWriteStream(`${path}/${title.trim()}/config.json`)
        writeStream.write(JSON.stringify(configData))
        writeStream.end();
        console.log('文件夹创建成功，开始下载.....');
    } catch(err) {
        console.log(err);
        console.log(`${path}/${title.trim()}    目录存在，开始下载......`);
    }
    

    // 创建cmd合并脚本
    let cmdtext = iconvLite.encode(`copy /b *.ts ..\\private\\private\\${title.trim()}.ts`,'gbk')
    var writeStream = fs.createWriteStream(`${path}/${title.trim()}/merge.cmd`)
    writeStream.write(cmdtext)
    writeStream.end();
    console.log('脚本创建成功....');

    let schedule = 0; // 控制进度
    for (let i = 0; i < flowvideourl.length; i++) {
        if (!i) {
            // 读取配置文件
            fs.readFile(`${path}/${title.trim()}/config.json`, 'utf-8', function (err, data) {
                let config = JSON.parse(data)
                if (config.record != "") {
                    const index = flowvideourl.findIndex(v => v == config.record)
                    if (index != -1) {
                        i = index
                    }
                    console.log('断点续传中' + '-' +index + '-' + flowvideourl[i]);
                }
            })
        }
        let data; 
        try {
            data = await axios({
                url: `${host}${flowvideourl[i]}`,
                headers: header,
                responseType: 'arraybuffer'
            })
        } catch (err) {
            console.log(flowvideourl[i],'下载失败');
            return
        }
        if (data.status != 200) {
            console.log(flowvideourl[i], '下载失败');
            return
        }
        let name = ''
        if (i < 10){
            name = '000' + i
        } else if (i < 100){
            name = '00' + i
        } else if (i < 1000) {
            name = '0' + i
        } else {
            name = i
        }
        const updatePath =  `${path}/${title.trim()}/${name}.ts`
        // 储存到本地
        fs.writeFileSync(updatePath, data.data, 'binary')
        schedule = i + 1
        let nuvber = parseInt(schedule / flowvideourl.length * 100)
        let nuvberstr = ''
        for (let i = 0; i < nuvber; i++) {
            nuvberstr += '>'
        }
        for (let i = 0; i < 100 - nuvber; i++) {
            nuvberstr += '='
        }
        console.log(nuvberstr +' ' + nuvber + '%');
        // 写入配置
        fs.readFile(`${path}/${title.trim()}/config.json`, 'utf-8', function (err, data) {
            if (err) return console.log('配置文件读取出错');
            let config = JSON.parse(data)
            config.record = flowvideourl[i]
            let new_JSON  = JSON.stringify(config);
            fs.writeFile(`${path}/${title.trim()}/config.json`,new_JSON,function(err){
                if (err) return console.log('配置文件写入出错！！');
            })
        })
    }
    // 下载完成，合并视频
    child_process.execFile("merge.cmd",null,{cwd:`${path}/${title.trim()}`},function(error,stdout,stderr){
        if(error !==null){
            console.log("exec error"+error)
        }
        else console.log("合并脚本运行完成")
        // 运ffmpeng转码
        const Feeppath = nodepath.resolve(path)
    const phone_path = videoMd5 + '.jpg'
    const FeepImagepath = nodepath.resolve(imagePath)
        child_process.exec(`ffmpeg -i "${Feeppath}/private/private/${title.trim()}.ts" -c copy ${Feeppath}/private/${videoMd5}.mp4`,function(error,stdout,stderr){
            if(error !==null){
                console.log("exec error"+error, '转码失败')
            } else {
                console.log('转码完成..');
                // 删除ts视频
                fs.unlinkSync(`${path}/private/private/${title.trim()}.ts`);
                 // 生成截图 
                child_process.exec(`ffmpeg -ss 00:00:01 -i "${Feeppath}/private/${videoMd5}.mp4"  -frames:v 1 -y ${FeepImagepath}/${phone_path}`,function(error,stdout,stderr){
                    if(error !==null){
                        console.log("exec error"+error, '转码失败')
                    } else {
                        console.log('转码完成..');
                        // 删除ts视频
                        fs.unlinkSync(`${path}/private/private/${fileName}.ts`);
                    }
                })
            }
        })
        // 删除文件夹
        let checkUrl = `${path}/${title.trim()}`　　　　//检查文件是否已经存在
        let reservePath = fs.existsSync(checkUrl)
        if (fs.existsSync(checkUrl)) {
            if (fs.statSync(checkUrl).isDirectory()) {
                let files = fs.readdirSync(checkUrl);
                files.forEach((file, index) => {
                    let currentPath = checkUrl + "/" + file;
                    if (fs.statSync(currentPath).isDirectory()) {
                        delFile(currentPath, reservePath);
                    } else {
                        fs.unlinkSync(currentPath);
                    }
                });
                if (checkUrl != reservePath) {
                    fs.rmdirSync(checkUrl);
                }
            } else {
                fs.unlinkSync(checkUrl);
            }
        }
    })
    const up_time = new Date().getTime()
        const state = 2
            var sql = `INSERT INTO material (user_id, phone_path, video_path, md5, scene_desc, state, up_time, type, ks_id) VALUES (?,?,?,?,?,?,?,?,?)`
            var sqlArr = [user_id, videoMd5 + '.jpg', `private/${videoMd5}.mp4`, videoMd5, title.trim(), state, up_time, 2, videoMd5]
            var result = await SySqlConnect(sql, sqlArr)
            if (result === undefined) {
                console.log('数据库写入失败，退出下载')
            } else if(result.affectedRows === 0) {
                console.log('数据库写入失败，退出下载')
            }
            console.log('写入数据库成功');
    index++
    digui(urlArrliu, index)
}


// 数组最大值与下标获取
function getMax(arr){
	// var arr = [1,56,23,6,43,87,3,5,555,187];
	var max = arr[0];
	var maxIndex = 0;
	for(var i = 1; i < arr.length; i++){
		if(arr[i] > max){
			max = arr[i];
			maxIndex = i;
		}
	}
	return {max: max , maxIndex: maxIndex}
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