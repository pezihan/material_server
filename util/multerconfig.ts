let multer = require('multer');
var md5 = require('blueimp-md5');
var pathFile = require('../file_path_config.json')
var nodepath = require('path')

// 头像
let limits1 = {
    //限制文件大小1m
    fileSize: 1024 * 1024 * 1,
    //限制文件数量
    files: 1
}
let storage1 =  multer.diskStorage({
    destination: function (req: any, file: any, cb: any) {
        if (file) {
            cb(null, `${pathFile.path}/user_images`);
        }
    },
    filename: function (req: any, file: any, cb: any) {
        if (file) {
            const user_id = req.userMsg == undefined ? 'admin' : req.userMsg.id
            const verifyInt = Math.floor(Math.random() * (999999-100000)) + 100000
            var changedName = md5((user_id + new Date().getTime())+ verifyInt + file.originalname) + nodepath.extname(file.originalname)
            cb(null, changedName);
            req.filePath = changedName
        }
    }
})
let fileFilter1 = function(req: any, file: any, cb: any) {
    // 限制文件上传类型，仅可上传png格式图片
    if(file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg'){
        cb(null, true)
    } else {
        cb(null, false)
    }
}

// 素材图、视频
let limits2 = {
    //限制文件大小2g
    fileSize: 1024 * 1024 * 2000,
    //限制文件数量
    files: 1
}
let storage2 =  multer.diskStorage({
    destination: function (req: any, file: any, cb: any) {
        if (file) {
            cb(null, `${pathFile.path}/${req.storagePath}`);
        }
    },
    filename: function (req: any, file: any, cb: any) {
        if (file) {
            const user_id = req.userMsg.id
            const verifyInt = Math.floor(Math.random() * (999999-100000)) + 100000
            var Md5 =  md5((user_id + new Date().getTime())+ verifyInt + file.originalname)
            var filePath = Md5 + nodepath.extname(file.originalname)
            cb(null, filePath);
            // if (file.mimetype == 'video/mp4' || file.mimetype == 'video/avi' || file.mimetype == 'video/mov') {
            //     req.filePath = Md5 + '.mp4'
            // } else {
            //     req.filePath = Md5
            // }
            req.filePath = filePath
            req.md5 = Md5
        }
    }
})
let fileFilter2 = function(req: any, file: any, cb: any) {
    // 限制文件上传类型，仅可上传png格式图片
    if(file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg' ||
    file.mimetype == 'video/mp4' || file.mimetype == 'video/avi' || file.mimetype == 'video/mov'){
        cb(null, true)
    } else {
        cb(null, false)
    }
}


let updateUserImg = multer({ limits: limits1, storage:storage1, fileFilter: fileFilter1 }).single('file')  // 头像
let updateImg = multer({ limits: limits2, storage: storage2, fileFilter: fileFilter2 }).single('file')       // 图片素材


module.exports = {
    updateUserImg,
    updateImg
}