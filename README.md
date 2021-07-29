# material_server

### 介绍

### material_web客户端 与 material_admin_web管理端服务器 API 

**material_admin_web 前端项目地址**：https://github.com/pezihan/material_web

**material_web 前端项目地址**：https://github.com/pezihan/material_admin_web

API 接口文档：已部署至本项目根节点  

`material_admin_web管理前端已打包成静态资源放在此项目下、运行项目访问默认端口可访问；默认端口：5000`

**管理系统默认账户密码：admin  密码：123456**

### 项目环境

- 本地依赖环境

 Node.js + MySQL + ffmpeg

- 创建数据库

  数据库文件在：db --> material.sql

  创建数据库 material，运行material.sql  SQL 语句导入数据库

  `注：创建数据库 material 选择字符集utf8mb4 `

  **​ 数据库默认连接名：root   密码： 123456**

   可在 util --> key.ts 修改

- 安装 ffmpeg 工具（用来给上传的视频作品截取封面图）

  下载地址： http://www.ffmpeg.org/download.html

- 指定视频及图片资源存储位置

   修改项目根目录下的 file_path_config.json 文件 （`相对路径或绝对路径都可`）

### 安装

```
# 克隆项目
git clone https://github.com/pezihan/material_server.git

# 进入项目目录
cd material_server

# 安装依赖
npm install

# 本地开发 启动项目
npm run start
```
