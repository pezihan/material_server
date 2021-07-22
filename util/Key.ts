var filePath = require('../file_path_config.json')

const mysqlKey = {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '123456', 
    database: 'material'
}

const visitPath = {
    images: '/resource/material_images/', // 图片素材存储位置 （包括用户背景图）
    video: '/resource/material_video/',   // 视频素材存储位置
    user_images: '/resource/user_images/' // 用户头像存储位置
}

// 对应素材存储位置
const fileVisitPath = {
    images: filePath.path + '/material_images/', // 图片素材存储位置 （包括用户背景图）
    video:  filePath.path + '/material_video/',   // 视频素材存储位置
    user_images: filePath.path + '/user_images/' // 用户头像存储位置
}

module.exports = {
    mysqlKey,
    visitPath,
    fileVisitPath
}