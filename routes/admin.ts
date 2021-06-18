var express = require('express');
const AdminMessage = require('../controllers/admin-side/adminMessage')
const AdminTag = require('../controllers/admin-side/adminTag')
const AdminUsers = require('../controllers/admin-side/adminUser')
const AdminMaterial = require('../controllers/admin-side/adminMaterial')
var router = express.Router();

/* 管理员登录. */
router.post('/login', AdminMessage.adminLogin)
/* 获取所有管理账号信息. */
router.get('/allAdminUser', AdminMessage.allAdminUser)
/* 添加管理账号 */
router.post('/addAdminUser', AdminMessage.addAdminUser)
/* 修改管理账号类型 */
router.put('/setAdminStatus', AdminMessage.setAdminStatus)
/* 修改管理账号类型 */
router.post('/editAdmin', AdminMessage.editAdmin)
/* 删除管理账号 */
router.delete('/delAdmin', AdminMessage.delAdmin)

// 获取标签
router.get('/getTag', AdminTag.getTag)
// 添加标签
router.put('/addTag', AdminTag.addTag)
// 删除标签
router.delete('/delTag', AdminTag.delTag)

// 获取用户列表
router.get('/userList', AdminUsers.userList)
// 获取资源访问路径
router.get('/getPath', AdminUsers.getPath)
// 上传头像
router.post('/updateimage', AdminUsers.updateimage)
// 添加账号
router.post('/addVirtualUser', AdminUsers.addVirtualUser)
// 修改账户信息
router.post('/setVirtualUser', AdminUsers.setVirtualUser)
// 修改账户密码
router.post('/virtualReset', AdminUsers.virtualReset)
// 修改账户的状态
router.put('/sealUser', AdminUsers.sealUser)
// 删除用户
router.delete('/virtualUserDel', AdminUsers.virtualUserDel)
// 获取搜索关键词
router.get('/getkeyword', AdminUsers.getkeyword)
// 删除搜索关键词
router.delete('/delkeyword', AdminUsers.delkeyword)
// 批量删除搜索关键词
router.post('/delkeyword', AdminUsers.delAllkeyword)
// 修改关键词
router.put('/setkeyword', AdminUsers.setkeyword)

// 获取素材列表
router.get('/getSceneList', AdminMaterial.getSceneList)
// 批量删除素材
router.delete('/deleteScene', AdminMaterial.deleteScene)
// 修改素材状态
router.put('/scenestatus', AdminMaterial.scenestatus)
// 修改素材状态
router.delete('/delsceneTag', AdminMaterial.delsceneTag)
// 获取分类标签
router.get('/sceneTagSearch', AdminMaterial.sceneTagSearch)
// 给素材添加分类标签
router.post('/addSceneTags', AdminMaterial.addSceneTags)


module.exports = router;
