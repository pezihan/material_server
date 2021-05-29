var express = require('express');
var router = express.Router();
const UserMessage = require('../controllers/client-side/userMessage')


// 测试
router.get('/test', UserMessage.test)
// 获取验证码
router.put('/verify', UserMessage.verify)
// // 注册
router.post('/sign', UserMessage.sign);
// // 登录
router.post('/login', UserMessage.login);

module.exports = router;
