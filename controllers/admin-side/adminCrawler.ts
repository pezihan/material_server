var TagDB = require('../../modules/TagDB')
var MaterialDB = require('../../modules/MaterialDB')
var UserDB = require('../../modules/UserDB')
var HttpCrawler = require('../../modules/httpCrawler')
var { fileVisitPath: dwonloadPath } = require('../../util/Key')
var makeTag = require('../../lib/makeTag')
var axios = require('axios')
var md5 = require('blueimp-md5')
var fs = require('fs')
var { create } = require('../../util/Screenshot')

// 图片爬取请求
const getImageReq  = async (req: any, res: any) => {
    const { keyword, pn } = req.query
    if (keyword == '' || keyword == undefined || pn == '' || pn == undefined || pn < 0) {
        res.send({data: [], meta: { msg: '请求参数错误', status: 403 }})
        return
    }
    const result = await HttpCrawler.getBaiduCrawler(keyword, pn)
    if (result == 'error') {
        res.send({data: [], meta: { msg: '爬取失败', status: 400 }})
        return
    }
    let data:any = []
    result.forEach((item: any) => {
        if (item.hasOwnProperty('middleURL')) {
            data.push(item)
        }
    })
    res.send({data: data, meta: { msg: '获取成功', status: 200 }})
}

// 图片下载请求
const setImagesReq = async (req: any, res: any) => {
    const { user_id, tagPitch, data } = req.body
    if (user_id == '' || user_id == undefined || data == '' || data == undefined) {
        res.send({data: {}, meta: { msg: '请求参数错误', status: 403 }})
        return
    }
    // 查询此用户是否存在
    const userMsg = await UserDB.getIdUserMsg(user_id)
    if (userMsg == 500) {
        res.send({data: {}, meta: { msg: 'Server error', status: 500 }})
        return
    } else if (userMsg.length == 0) {
        res.send({data: {}, meta: { msg: '此用户不存在', status: 404 }})
        return
    }
    // 查询此素材是否存在
    const verify = await MaterialDB.getArrUserMaterial([data.di])
    if (verify == 500) {
        res.send({data: {}, meta: { msg: 'Server error', status: 500 }})
        return
    } else if (verify.length != 0) {
        res.send({data: {}, meta: { msg: '此素材已存在', status: 100 }})
        return
    }
    // 下载素材
    const verifyInt = Math.floor(Math.random() * (999999-100000)) + 100000
    const sceneMd5 = md5(verifyInt + new Date().getTime() + user_id + data.middleUR)
    const updatePath = dwonloadPath.images + sceneMd5
    try {
        const { data: result } = await axios({url:data.middleURL, responseType: 'arraybuffer'})
        fs.writeFileSync(updatePath, result, 'binary')
        // 保存到数据库
        const Msg = await MaterialDB.adminSetUserMaterial(user_id, sceneMd5, '', sceneMd5 , 1 , data.fromPageTitleEnc, data.di)
        if (Msg == 500) {
            res.send({data: {}, meta: { msg: 'Server error', status: 500 }})
            return
        } else if (Msg == false) {
            res.send({data: {}, meta: { msg: '写入数据库失败', status: 400 }})
            return
        }
        res.send({data: { id: data.di }, meta: { msg: '下载成功', status: 201 }})
        // 查询用户传来的标签内容
        const tagArr = tagPitch.map((v: any) => v.id)
        const tagMsg = await TagDB.getTagMsg(tagArr)
        if (tagMsg == 500) {
            console.log(new Date().toLocaleString(),'分类标签查询失败');
        }
        // 将用户传过来的分类标签写入数据
        const msg = await TagDB.setScnenTag(data.di, tagMsg)
        if (msg == 500 || msg == false) {
            console.log(new Date().toLocaleString(),'分类标签存储失败');
        }
        // 通过文案对此素材进行分类
        if (data.fromPageTitleEnc != '' || data.fromPageTitleEnc != undefined) {
            makeTag.participle(data.di, data.fromPageTitleEnc)
        }
    } catch (err) {
        console.log(new Date().toLocaleString(),`${data.middleURL}下载失败`, err)
        res.send({data: { err }, meta: { msg: '下载失败', status: 400 }})
    }
}

// 视频爬取请求
const getVideoReq = async (req: any, res: any) => {
    const { keyword, pn, searchId } = req.query
    if (keyword == '' || keyword == undefined || pn == '' || pn == undefined || pn < 0) {
        res.send({data: {}, meta: { msg: '请求参数错误', status: 403 }})
        return
    }
    const result = await HttpCrawler.getKuaishouCrawler(keyword, pn, searchId)
    if (result == 'error') {
        res.send({data: {}, meta: { msg: '爬取失败', status: 400 }})
        return
    }
    res.send({data: result, meta: { msg: '获取成功', status: 200 }})
}

// 视频下载请求
const setVideoReq = async (req:any, res: any) => {
    const { user_id, tagPitch, data } = req.body
    if (user_id == '' || user_id == undefined || data == '' || data == undefined) {
        res.send({data: {}, meta: { msg: '请求参数错误', status: 403 }})
        return
    }
    // 查询此用户是否存在
    const userMsg = await UserDB.getIdUserMsg(user_id)
    if (userMsg == 500) {
        res.send({data: {}, meta: { msg: 'Server error', status: 500 }})
        return
    } else if (userMsg.length == 0) {
        res.send({data: {}, meta: { msg: '此用户不存在', status: 404 }})
        return
    }
    // 查询此素材是否存在
    const verify = await MaterialDB.getVideoUserMaterial(data.photo.id)
    if (verify == 500) {
        res.send({data: {}, meta: { msg: 'Server error', status: 500 }})
        return
    } else if (verify.length != 0) {
        res.send({data: {}, meta: { msg: '此素材已存在', status: 100 }})
        return
    }
    // 下载素材
    const verifyInt = Math.floor(Math.random() * (999999-100000)) + 100000
    const sceneMd5 = md5(verifyInt + new Date().getTime() + user_id + data.photo.id)
    const updatePath = dwonloadPath.video + sceneMd5 + '.mp4'
    try {
        const { data: result } = await axios({url:data.photo.photoUrl, responseType: 'arraybuffer'})
        fs.writeFileSync(updatePath, result, 'binary')
        // 截取图片
        const imagePath = dwonloadPath.images + sceneMd5
        const imageRes = await create(updatePath, imagePath, sceneMd5)
        if (imageRes == false || imageRes == undefined) {
            res.send({data: {}, meta: { msg: 'Server error', status: 500 }})
            return
        }
        // 保存到数据库
        const Msg = await MaterialDB.adminSetVideoMaterial(user_id, sceneMd5, sceneMd5, sceneMd5 , 2 , data.photo.caption, data.photo.id)
        if (Msg == 500) {
            res.send({data: {}, meta: { msg: 'Server error', status: 500 }})
            return
        } else if (Msg == false) {
            res.send({data: {}, meta: { msg: '写入数据库失败', status: 400 }})
            return
        }
        res.send({data: { id: Msg }, meta: { msg: '下载成功', status: 201 }})
        // 查询用户传来的标签内容
        const tagArr = tagPitch.map((v: any) => v.id)
        const tagMsg = await TagDB.getTagMsg(tagArr)
        if (tagMsg == 500) {
            console.log(new Date().toLocaleString(),'分类标签查询失败');
        }
        // 将用户传过来的分类标签写入数据
        const msg = await TagDB.setScnenTag(Msg, tagMsg)
        if (msg == 500 || msg == false) {
            console.log(new Date().toLocaleString(),'分类标签存储失败');
        }
        // 通过文案对此素材进行分类
        if (data.photo.caption != '' || data.photo.caption != undefined) {
            makeTag.participle(Msg, data.fromPageTitleEnc)
        }
    } catch (err) {
        console.log(new Date().toLocaleString(),`${data.photo.photoUrl}下载失败`, err)
        res.send({data: { err }, meta: { msg: '下载失败', status: 400 }})
    }
}


module.exports = {
    getImageReq,
    setImagesReq,
    getVideoReq,
    setVideoReq
}