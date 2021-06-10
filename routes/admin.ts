var express = require('express');
const AdminMessage = require('../controllers/admin-side/adminMessage')
var router = express.Router();

/* 管理员登录. */
router.post('/login', AdminMessage.adminLogin)

module.exports = router;
