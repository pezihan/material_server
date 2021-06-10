const mysqlKey = {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '123456',
    database: 'material'
}

const visitPath = {
    images: '/public/material_images/', // 图片素材存储位置 （包括用户背景图）
    video: '/public/material_video/',   // 视频素材存储位置
    user_images: '/public/user_images/' // 用户头像存储位置
}

module.exports = {
    mysqlKey,
    visitPath
}