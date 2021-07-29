const axios = require('axios')
const fs = require('fs')
var child_process=require("child_process")
const iconvLite = require('iconv-lite')
const exec = require('child_process').exec;
const inquirer = require('inquirer')
const mysql = require('mysql')
const md5 = require('blueimp-md5')
const nodepath = require('path')
const filePath = require('../file_path_config.json')


//创建临时目录
try {
    fs.mkdirSync(`${path}/temporary`)
    fs.mkdirSync(`${path}/private`)
    fs.mkdirSync(`${path}/private/private`)
} catch(err) {
    console.log(`临时目录存在目录存在，开始下载......`);
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
    name: 'query',
    message: "请输入爬取关键字：",
},
{
    type: 'input',
    name: 'limet',
    message: "请输入爬取页码（默认为0）：",
},
{
    type: 'input',
    name: 'max',
    message: "请输入最大爬取数（默认下载1条）：",
},
{
    type: 'input',
    name: 'user_id',
    message: "请输入要存储到的用户id",
}] 

var onequers = [{
        type: 'input',
        name: 'url',
        message: "请输入爬取视频地址："
    },
    {
        type: 'input',
        name: 'user_id',
        message: "请输入要存储到的用户id",
    }
]

var xuanze = [{
    type: 'input',
    name: 'type',
    message: "请选择爬取模式（1：搜索列表爬取；2：单条视频地址爬取; 默认1）：",
}]

// 关键字
let query = ''
// 最大下载数量
let max = 1
// 用户id
let user_id = null
//let path = '../public/material_video' // 默认存储位置
let path = filePath.path.lastIndexOf('.') !== -1 ? '../' + filePath.path + '/material_video' : filePath.path + '/material_video'
let imagePath = filePath.path.lastIndexOf('.') !== -1 ? '../' + filePath.path + '/material_images' : filePath.path + '/material_images'
let sum = 0
const url = `https://xiguax1.xyz`
let header,param;
let vdeioweb = ''
let limet = 0

inquirer.prompt(xuanze).then(answers1 => {
    if (answers1.type == 1) {
        inquirer.prompt(questions).then(answers => {
            query = answers.query
            max = answers.max
            if (answers.limet != '' || answers.limet != undefined) {
                limet = answers.limet
            }
            user_id = answers.user_id
            header = {
                'user-agent' : 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
                'referer' : 'https://xyunso3.xyz/?mod=search&k=c',
                'cookie' : 'PHPSESSID=09kp85jsn4g0glhlk4oa7pim61; UBGLAI63GV=kajhy.1620666769; __ty_cpvx_t_4504_cpv_plan_ids=%7C3%7C; __ty_cpvx_t_4504_cpv_plan_uids=%7C6%7C; __51uvsct__JHidR6xnmvB1bjy4=1; __51vcke__JHidR6xnmvB1bjy4=830f8590-6ba7-5e87-b57a-e3de223f8631; __51vuft__JHidR6xnmvB1bjy4=1620666770386; __51uvsct__JHif6c3b1pRwZtOF=1; __51vcke__JHif6c3b1pRwZtOF=782331c4-13a6-5e86-9028-1b973dee7763; __51vuft__JHif6c3b1pRwZtOF=1620666770409; Hm_lvt_b8afbcaa9ff38d6f86ebb5962ff61b14=1620666775; Hm_lpvt_b8afbcaa9ff38d6f86ebb5962ff61b14=1620666775; need_wd_lm=1; v_popped=1; v_lm_times=3; __vtins__JHidR6xnmvB1bjy4=%7B%22sid%22%3A%20%22d4bcf2ae-379f-59fc-9412-80ed49adc35f%22%2C%20%22vd%22%3A%204%2C%20%22stt%22%3A%20756337%2C%20%22dr%22%3A%208686%2C%20%22expires%22%3A%201620669326713%2C%20%22ct%22%3A%201620667526713%7D; __vtins__JHif6c3b1pRwZtOF=%7B%22sid%22%3A%20%22ef23e4f7-1ff6-5ac3-ba85-c253bd9729a2%22%2C%20%22vd%22%3A%204%2C%20%22stt%22%3A%20756342%2C%20%22dr%22%3A%208693%2C%20%22expires%22%3A%201620669326741%2C%20%22ct%22%3A%201620667526741%7D; jump_28=0; __ty_cpvx_b_9844_cpv_plan_ids=%7C164%7C%7C131%7C; __ty_cpvx_b_9844_cpv_plan_uids=%7C3582%7C%7C63%7C'
            }
            user_id = answers.user_id
            param = {
                mod: 'search',
                k: query.trim(),
                quality: 'hd',
                p: limet
            }
            getwebListData()
        })
    } else if (answers1.type == 2) {
        inquirer.prompt(onequers).then(async answers2 => {
            vdeioweb = answers2.url
            user_id = answers2.user_id
            header = {
                'user-agent' : 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
                'referer' : 'https://xyunso3.xyz/?mod=search&k=c',
                'cookie' : 'PHPSESSID=09kp85jsn4g0glhlk4oa7pim61; UBGLAI63GV=kajhy.1620666769; __ty_cpvx_t_4504_cpv_plan_ids=%7C3%7C; __ty_cpvx_t_4504_cpv_plan_uids=%7C6%7C; __51uvsct__JHidR6xnmvB1bjy4=1; __51vcke__JHidR6xnmvB1bjy4=830f8590-6ba7-5e87-b57a-e3de223f8631; __51vuft__JHidR6xnmvB1bjy4=1620666770386; __51uvsct__JHif6c3b1pRwZtOF=1; __51vcke__JHif6c3b1pRwZtOF=782331c4-13a6-5e86-9028-1b973dee7763; __51vuft__JHif6c3b1pRwZtOF=1620666770409; Hm_lvt_b8afbcaa9ff38d6f86ebb5962ff61b14=1620666775; Hm_lpvt_b8afbcaa9ff38d6f86ebb5962ff61b14=1620666775; need_wd_lm=1; v_popped=1; v_lm_times=3; __vtins__JHidR6xnmvB1bjy4=%7B%22sid%22%3A%20%22d4bcf2ae-379f-59fc-9412-80ed49adc35f%22%2C%20%22vd%22%3A%204%2C%20%22stt%22%3A%20756337%2C%20%22dr%22%3A%208686%2C%20%22expires%22%3A%201620669326713%2C%20%22ct%22%3A%201620667526713%7D; __vtins__JHif6c3b1pRwZtOF=%7B%22sid%22%3A%20%22ef23e4f7-1ff6-5ac3-ba85-c253bd9729a2%22%2C%20%22vd%22%3A%204%2C%20%22stt%22%3A%20756342%2C%20%22dr%22%3A%208693%2C%20%22expires%22%3A%201620669326741%2C%20%22ct%22%3A%201620667526741%7D; jump_28=0; __ty_cpvx_b_9844_cpv_plan_ids=%7C164%7C%7C131%7C; __ty_cpvx_b_9844_cpv_plan_uids=%7C3582%7C%7C63%7C'
            }
            await getonewebListData()
        })
    } else {
        console.log('参数错误');
        return
    }
})


// 解析搜索结果
async function getwebListData() {
    // 查询用户是否存在
    const sql = `SELECT * FROM users WHERE id = ?`
    const sqlArr = [user_id]
    const result = await SySqlConnect(sql, sqlArr)
    if (result === undefined) {
        return console.log('用户查询失败，准备退出');
    } else if (result.length == 0) {
        return console.log('用户不存在，准备退出');
    }
    const  data  = await axios.get(url, {headers: header, params: param})
    if (data.status != 200) {
        console.log('视频数据列表获取失败');
        return
    }
    let strArr = String(data.data).split('<li>')
    let newArr = []
    for (let i=0;i<strArr.length;i++) {
        newArr.push({
            url: strArr[i].substring(strArr[i].search('<a href="'), strArr[i].search('<img class="lazy')),
            title: strArr[i].substring(strArr[i].search('<span style="background-color'), strArr[i].search('<span class="duration'))
        })
    }
    let listdata = []
    for (let i = 1;i < newArr.length; i++) {
        listdata.push({
            url: newArr[i].url.substring(newArr[i].url.search('/'),newArr[i].url.lastIndexOf('/')+1).trim(),
            title: newArr[i].title.substring(newArr[i].title.search('>')+1)
        })
    }
    listdata.forEach((item, index) => {
        let str = ''
        for (let i = 0; i < item.title.length; i++) {
            var strew = /^[\u4E00-\u9FA5A-Za-z0-9_]+$/
            if (strew.test(item.title[i])) {
                str += item.title[i]
            }
        }
        item.title = str
    })
    console.log('视频列表解析成功');
    opendataWeb (listdata)
}


// 获取视频高清地址 （批量下载）
async function opendataWeb (list) {
    console.log('开始解析视频信息.........');
    for (let i = 0; i < list.length; i++) {
        if (sum > max) {
            console.log(`已完成${max}条下载设置，即将退出`);
            return
        } else if (list[i].url != '' || list[i].url != null ) {
            const  data  = await axios.get(url + list[i].url, {headers: header})
            if (data.status != 200) {
                console.log('视频数据解析失败');
                return
            }
            let webstr1 = String(data.data).substring(String(data.data).lastIndexOf('原画'))
            let webstr2 = webstr1.substring(webstr1.search('url:'),webstr1.search('type:')).trim()
            const urlpath = webstr2.substring(6,webstr2.length - 2)
            console.log('解析视频信息成功，开始下载........' + urlpath);
            await doenload(urlpath, list[i].title) // 详细页面的视频情绪度链接
            sum++
        }
    }
    // 此页下载完，请求下一页
    param.p ++
    getwebListData()
}

// 单条视频链接爬取下载
async function getonewebListData() {
    // 查询用户是否存在
    const sql = `SELECT * FROM users WHERE id = ?`
    const sqlArr = [user_id]
    const result = await SySqlConnect(sql, sqlArr)
    if (result === undefined) {
        return console.log('用户查询失败，准备退出');
    } else if (result.length == 0) {
        return console.log('用户不存在，准备退出');
    }
    console.log('开始解析视频信息.........');
    const  data  = await axios.get(vdeioweb, {headers: header})
    if (data.status != 200) {
        console.log('视频数据解析失败');
        return
    }
    // 获取视频标题
    let ttitletext = String(data.data).substring(String(data.data).search('视频名'), String(data.data).lastIndexOf('<button class="buttons little">')).trim()
    const title = ttitletext.substring(5, ttitletext.lastIndexOf('】') - 1)
    console.log(title);
    // 获取视频播放地址
    let webstr1 = String(data.data).substring(String(data.data).lastIndexOf('原画'))
    let webstr2 = webstr1.substring(webstr1.search('url:'),webstr1.search('type:')).trim()
    const urlpath = webstr2.substring(6,webstr2.length - 2)
    console.log('解析视频信息成功，开始下载........' + urlpath);
    await doenload(urlpath, title) // 详细页面的视频情绪度链接
    sum++
}


// 下载视频处理
async function doenload (urlpath, title) {
    // 查询此视频是否存在数据库中
    const videoMd5 = md5(urlpath.substring(urlpath.search('videos/'),urlpath.lastIndexOf('/')))
    var sql = `SELECT * FROM material WHERE ks_id = "${videoMd5}"`
    var result = await SySqlConnect(sql)
    if (result == undefined) {
        console.log('数据库查询失败，取消下载');
    } else if (result.length != 0) {
        console.log('视频已存在，开始下载下一条');
        return
    }

    const  data  = await axios.get(urlpath, {headers: header})
    if (data.status != 200) {
        console.log('视频数据列表获取失败');
        return
    }
    const strArr = String(data.data).split('#EXT-X-STREAM-INF:')
    let videourl = []
    for (let i = 1; i < strArr.length; i++) {
        videourl.push(strArr[i].substring(strArr[i].search('hls'),strArr[i].lastIndexOf('.m3u8')).trim() + '.m3u8')
    }
    console.log('视频清晰度信息获取成功,默认下载最大清晰度...');
    console.log(videourl);
    let temporary = []
    videourl.forEach((item,index) => {
        temporary.push(item.substring(0,item.search('p')))
    })
    let qinximax = []
    var zhengze = /^[0-9]*$/
    temporary.forEach((item, index) => {
        let nvm = 0
        for (let i = 0; i < item.length; i++) {
            if (zhengze.test(item[i])) {
                nvm += item[i]
            }
        }
        qinximax[index] = Number(nvm)
    })
    const maxIndex = getMax(qinximax)
    const videoPath = videourl[maxIndex.maxIndex]
    // 拼接下载地址
    const host = urlpath.substring(0, urlpath.lastIndexOf('/')+1)
    // 获取视频数据流文件列表
    console.log('获取原画文件流' + host + videoPath);
    const  videoListDat = await axios.get(host + videoPath, {headers: header})
    if (videoListDat.status != 200) {
        console.log('获取视频数据流文件列表失败');
        return
    }
    const flowstrArr = String(videoListDat.data).split('#EXTINF:')
    let flowvideourl = [] // 流文件列表
    for (let i = 1; i < flowstrArr.length; i++) {
        flowvideourl.push(flowstrArr[i].substring(flowstrArr[i].search('hls'),flowstrArr[i].lastIndexOf('.ts')).trim() + '.ts')
    }
    // 开始下载 创建文件夹
    try {
        fs.mkdirSync(`${path}/temporary/${title.trim()}`);
        // 创建配置文件
        let configData = { record:  ""}
        var writeStream = fs.createWriteStream(`${path}/temporary/${title.trim()}/config.json`)
        writeStream.write(JSON.stringify(configData))
        writeStream.end();
        console.log('文件夹创建成功，开始下载.....');
    } catch(err) {
        console.log(err);
        console.log(`${path}/temporary/${title.trim()}    目录存在，开始下载......`);
    }
    
    const fileName = md5(new Date().getTime() + title.trim() + videoMd5)
    // 创建cmd合并脚本
    let cmdtext = iconvLite.encode(`copy /b *.ts ..\\..\\private\\private\\${fileName}.ts`,'gbk')
    var writeStream = fs.createWriteStream(`${path}/temporary/${title.trim()}/merge.cmd`)
    writeStream.write(cmdtext)
    writeStream.end();
    console.log('脚本创建成功....');

    let schedule = 0; // 控制进度
    for (let i = 0; i < flowvideourl.length; i++) {
        if (!i) {
            // 读取配置文件
            fs.readFile(`${path}/temporary/${title.trim()}/config.json`, 'utf-8', function (err, data) {
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
                url: host + flowvideourl[i],
                headers: header,
                responseType: 'arraybuffer'
            })
        } catch (err) {
            console.log(err.status)
        }
        if (data.status != 200) {
            console.log('下载失败');
            return
        }
        const updatePath =  `${path}/temporary/${title.trim()}/${i}.ts`
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
        fs.readFile(`${path}/temporary/${title.trim()}/config.json`, 'utf-8', function (err, data) {
            if (err) return console.log('配置文件读取出错');
            let config = JSON.parse(data)
            config.record = flowvideourl[i]
            let new_JSON  = JSON.stringify(config);
            fs.writeFile(`${path}/temporary/${title.trim()}/config.json`,new_JSON,function(err){
                if (err) return console.log('配置文件写入出错！！');
            })
        })
    }
    // 下载完成，合并视频
    child_process.execFile("merge.cmd",null,{cwd:`${path}/temporary/${title.trim()}`},function(error,stdout,stderr){
        if(error !==null){
            console.log("exec error"+error)
            // 写入配置
            fs.readFile(`${path}/temporary/${title.trim()}/config.json`, 'utf-8', function (err, data) {
                if (err) return console.log('配置文件读取出错');
                let new_JSON  = ''
                fs.writeFile(`${path}/temporary/${title.trim()}/config.json`,new_JSON,function(err){
                    if (err) return console.log('配置文件写入出错！！');
                })
            })
            return
        }
        else console.log("合并脚本运行完成")
        // 运ffmpeng转码
        const Feeppath = nodepath.resolve(path)
        const phone_path = fileName + '.jpg'
        const FeepImagepath = nodepath.resolve(imagePath)
        child_process.exec(`ffmpeg -i "${Feeppath}/private/private/${fileName}.ts" -c copy ${Feeppath}/private/${fileName}.mp4`,function(error,stdout,stderr){
            if(error !==null){
                console.log("exec error"+error, '转码失败')
            } else {
                console.log('转码完成..');
                // 删除ts视频
                fs.unlinkSync(`${path}/private/private/${fileName}.ts`);
                // 生成截图 
            child_process.exec(`ffmpeg -ss 00:00:01 -i "${Feeppath}/private/${fileName}.mp4"  -frames:v 1 -y ${FeepImagepath}/${phone_path}`,function(error,stdout,stderr){
                if(error !==null){
                    console.log("exec error"+error, '截图失败')
                } else {
                    console.log('截图..');
                    // 重命名
                    // fs.rename(`${Feeppath}/private/${fileName}.mp4`, `${Feeppath}/private/${fileName}`, (err) => { if (err) { console.log('重命名失败') }})
                    // fs.rename(`${FeepImagepath}/${phone_path}`, `${FeepImagepath}/${fileName}`, (err) => { if (err) { console.log('重命名失败') }})
                }
            })
            }
        })
        // 删除文件夹
        let checkUrl = `${path}/temporary/${title.trim()}`　　　　//检查文件是否已经存在
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
            var sqlArr = [user_id, fileName + '.jpg', `private/${fileName}.mp4`, fileName, title.trim(), state, up_time, 2, videoMd5]
            var result = await SySqlConnect(sql, sqlArr)
            if (result === undefined) {
                console.log('数据库写入失败，退出下载')
            } else if(result.affectedRows === 0) {
                console.log('数据库写入失败，退出下载')
            }
            console.log('写入数据库成功');
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
        await exec(`ffmpeg -ss 00:00:15 -i ${path}  -frames:v 1 -y ${fileName}`, async function(error, stdout, stderr) {
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