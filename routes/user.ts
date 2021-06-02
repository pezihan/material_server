var express = require('express');
var router = express.Router();
const UserMessage = require('../controllers/client-side/userMessage')
const Usermaterial = require('../controllers/client-side/userMaterial')


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

// 获取用户素材
router.get('/usermaterial', Usermaterial.usermaterial)

module.exports = router;
