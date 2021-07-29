/*
 Navicat MySQL Data Transfer

 Source Server         : pezihan
 Source Server Type    : MySQL
 Source Server Version : 80022
 Source Host           : localhost:3306
 Source Schema         : material

 Target Server Type    : MySQL
 Target Server Version : 80022
 File Encoding         : 65001

 Date: 29/07/2021 22:30:51
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for admin_users
-- ----------------------------
DROP TABLE IF EXISTS `admin_users`;
CREATE TABLE `admin_users`  (
  `id` int(0) NOT NULL AUTO_INCREMENT COMMENT '用户id',
  `username` char(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户昵称',
  `password` char(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '密码',
  `status` int(0) NOT NULL COMMENT '1:普通；2：管理员；',
  `create_time` bigint(0) NOT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of admin_users
-- ----------------------------
INSERT INTO `admin_users` VALUES (1, 'admin', 'e10adc3949ba59abbe56e057f20f883e', 2, 23123123123);

-- ----------------------------
-- Table structure for material
-- ----------------------------
DROP TABLE IF EXISTS `material`;
CREATE TABLE `material`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '素材id',
  `user_id` int(0) NOT NULL COMMENT '~发布用户id',
  `phone_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '图片素材路径',
  `video_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '视频素材路径',
  `md5` char(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '素材验证',
  `scene_desc` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '描述',
  `state` int(0) NOT NULL COMMENT '1：上线，2：删除;',
  `up_time` bigint(0) NOT NULL COMMENT '上传时间',
  `state_text_id` char(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '~审核信息',
  `type` int(0) NOT NULL COMMENT '1: 图片；2：视频',
  `ks_id` char(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '快手爬取视频id',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 250408 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of material
-- ----------------------------

-- ----------------------------
-- Table structure for material_list_amount
-- ----------------------------
DROP TABLE IF EXISTS `material_list_amount`;
CREATE TABLE `material_list_amount`  (
  `id` int(0) NOT NULL AUTO_INCREMENT,
  `user_id` int(0) NOT NULL COMMENT '用户id',
  `scene_id` bigint(0) NOT NULL COMMENT '素材id',
  `receive_id` int(0) NOT NULL COMMENT '被点赞或收藏的用户id',
  `like_time` bigint(0) NOT NULL COMMENT '点赞或收藏时间',
  `type` int(0) NOT NULL COMMENT '1：点赞；2：收藏；',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 113 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of material_list_amount
-- ----------------------------

-- ----------------------------
-- Table structure for scene_tag_category
-- ----------------------------
DROP TABLE IF EXISTS `scene_tag_category`;
CREATE TABLE `scene_tag_category`  (
  `id` int(0) NOT NULL AUTO_INCREMENT COMMENT '标签类型id',
  `name` char(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '标签类型名',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 65 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of scene_tag_category
-- ----------------------------
INSERT INTO `scene_tag_category` VALUES (1, '家居生活');
INSERT INTO `scene_tag_category` VALUES (2, '美食图谱');
INSERT INTO `scene_tag_category` VALUES (3, '手工DIY');
INSERT INTO `scene_tag_category` VALUES (4, '时尚搭配');
INSERT INTO `scene_tag_category` VALUES (5, '美妆造型');
INSERT INTO `scene_tag_category` VALUES (6, '文字句子');
INSERT INTO `scene_tag_category` VALUES (7, '影视书籍');
INSERT INTO `scene_tag_category` VALUES (8, '人物明星');
INSERT INTO `scene_tag_category` VALUES (9, '植物多肉');
INSERT INTO `scene_tag_category` VALUES (10, '搞笑动物');
INSERT INTO `scene_tag_category` VALUES (11, '人物艺术');
INSERT INTO `scene_tag_category` VALUES (12, '生活百科');
INSERT INTO `scene_tag_category` VALUES (13, '壁纸');
INSERT INTO `scene_tag_category` VALUES (14, '旅行');
INSERT INTO `scene_tag_category` VALUES (15, '头像');
INSERT INTO `scene_tag_category` VALUES (16, '古风');
INSERT INTO `scene_tag_category` VALUES (17, '摄影');
INSERT INTO `scene_tag_category` VALUES (18, '动图');

-- ----------------------------
-- Table structure for scene_tag_relation
-- ----------------------------
DROP TABLE IF EXISTS `scene_tag_relation`;
CREATE TABLE `scene_tag_relation`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT,
  `scene_id` int(0) NOT NULL COMMENT '素材id',
  `tag_id` int(0) NOT NULL COMMENT '对应标签id',
  `tag_name` char(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '标签名字',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2913 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of scene_tag_relation
-- ----------------------------

-- ----------------------------
-- Table structure for user_hold
-- ----------------------------
DROP TABLE IF EXISTS `user_hold`;
CREATE TABLE `user_hold`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT,
  `user_id` int(0) NOT NULL COMMENT '当前用户id',
  `hold_id` int(0) NOT NULL COMMENT '关注的人id',
  `hold_time` bigint(0) NOT NULL COMMENT '关注的时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 30 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_hold
-- ----------------------------

-- ----------------------------
-- Table structure for user_keyword
-- ----------------------------
DROP TABLE IF EXISTS `user_keyword`;
CREATE TABLE `user_keyword`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT,
  `keyword` char(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '关键字',
  `user_id` int(0) NOT NULL COMMENT '用户id',
  `time` bigint(0) NOT NULL COMMENT '添加时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 88171 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_keyword
-- ----------------------------

-- ----------------------------
-- Table structure for user_one_comment
-- ----------------------------
DROP TABLE IF EXISTS `user_one_comment`;
CREATE TABLE `user_one_comment`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '评论id',
  `scene_id` int(0) NOT NULL COMMENT '作品id',
  `user_id` int(0) NOT NULL COMMENT '评论人id',
  `comment_text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '评论',
  `comment_time` bigint(0) NOT NULL COMMENT '评论时间',
  `receive_id` int(0) NOT NULL COMMENT '被评论人id',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 42 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_one_comment
-- ----------------------------

-- ----------------------------
-- Table structure for user_two_comment
-- ----------------------------
DROP TABLE IF EXISTS `user_two_comment`;
CREATE TABLE `user_two_comment`  (
  `id` bigint(0) NOT NULL AUTO_INCREMENT COMMENT '二级评论id',
  `comment_id` bigint(0) NOT NULL COMMENT '一级评论id',
  `user_id` int(0) NOT NULL COMMENT '评论人id',
  `comment_text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '评论',
  `comment_time` bigint(0) NOT NULL COMMENT '评论时间',
  `receive_id` int(0) NOT NULL COMMENT '被评论人id',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 23 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_two_comment
-- ----------------------------

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` int(0) NOT NULL AUTO_INCREMENT COMMENT '用户id',
  `user_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '用户头像',
  `user_name` char(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '用户昵称',
  `phone` char(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '账号',
  `creat_time` bigint(0) NOT NULL COMMENT '用户账号创建时间',
  `sex` int(0) NULL DEFAULT NULL COMMENT '0：男，1：女，2：未设置',
  `region` char(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '地区',
  `password` char(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '密码',
  `login_information` bigint(0) NOT NULL COMMENT '上次登陆时间',
  `verification` char(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '验证码信息',
  `signature` char(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '用户个性签名',
  `user_type` int(0) NOT NULL COMMENT '0:正常；1：已封号；',
  `background` char(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '用户背景',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 16 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------

SET FOREIGN_KEY_CHECKS = 1;
