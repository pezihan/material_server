var express = require('express');
var router = express.Router();
const UserMessage = require('../controllers/client-side/userMessage')
const UserMaterial = require('../controllers/client-side/userMaterial')
const HomeMaterial = require('../controllers/client-side/homeMaterial')


// 测试
router.get('/test', UserMessage.test)
// 获取验证码
router.put('/verify', UserMessage.verify)
// // 注册
router.post('/sign', UserMessage.sign);
// // 登录
router.post('/login', UserMessage.login);
// 资源访问路径获取
router.get('/resource', UserMessage.resource)
// 用户资料获取
router.get('/userMsg', UserMessage.userMsg)
// 用户资料获取
router.post('/upUserImages', UserMessage.upUserImages)
// 修改用户信息新
router.post('/setUserMsg', UserMessage.setUserMsg)
// 修改用户背景图
router.post('/background', UserMessage.background)
// 获取用户粉丝与关注列表
router.get('/holdlist', UserMessage.holdlist)
// 关注与取消关注
router.put('/hold', UserMessage.hold)

// 获取用户素材
router.get('/usermaterial', UserMaterial.usermaterial)
// 上传素材
router.post('/upMaterial', UserMaterial.upMaterial)
// 点赞与收藏
router.put('/likeCollet', UserMaterial.likeCollet)
// 删除素材
router.delete('/deleteMaterial', UserMaterial.deleteMaterial)
// 评论素材
router.post('/comment', UserMaterial.comment)
// 回复评论
router.post('/reply', UserMaterial.reply)

// 获取分类标签
router.get('/classify', HomeMaterial.classify)
// 获取推荐
router.get('/recommend', HomeMaterial.recommend)
// 获取分类素材
router.get('/sort', HomeMaterial.sort)
// 搜索
router.get('/search', HomeMaterial.search)
// 获取热搜
router.get('/hotSearch', HomeMaterial.hotSearch)

module.exports = router;
