var express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser')
const adminRouter = require('./routes/admin')
const userRouter = require('./routes/user')
const verifyPath = require('./controllers/verify')
var filePath = require('./file_path_config.json')
const cors = require('cors') // 跨域插件
const app = express();
var fs = require('fs')
// 端口
const port = 5000;

console.log('资源路径：',filePath.path);

// 改写
const http = require('http');
const server = http.createServer(app);

app.use(cors()) // 挂载跨域插件
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//静态资源
app.use('/public', express.static(path.join(__dirname, '../public')));
// app.use('/public', express.static(filePath.path))
app.use('/resource', function (req: any, res: any) { // 资源访问
  try {
    if (req.url.lastIndexOf('material_images') !== -1 || req.url.lastIndexOf('user_images') !== -1) { // 图片
      var content =  fs.readFileSync(filePath.path + req.url); 
      res.setHeader('Content-type','image/jpeg')
      res.send(content)
    } else if (req.url.lastIndexOf('material_video')) { // 视频
      // var content = fs.readFileSync(filePath.path + req.url);
      // res.setHeader('Content-type','video/mp4')
      // res.send(content) 
      var readStream = fs.ReadStream(filePath.path + req.url) // 流式传输
      res.writeHead(200, { 
        'Content-Type' : 'video/mp4', 
        'Accept-Ranges' : 'bytes', 
        'Server' : 'Microsoft-IIS/7.5', 
        'X-Powered-By' : 'ASP.NET'
        }); 
        readStream.on('close', function() { 
          res.end()
        }); 
        readStream.pipe(res)
    } else {
      res.send({data: {}, meta: { status: 404, msg: '404' }});
    }
  } catch (err) {
    console.log(err);
    res.send({data: {}, meta: { status: 404, msg: '404' }});
  }
})
app.use('/node_modules', express.static(path.join(__dirname, '../node_modules')));


app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json());


app.use('/', verifyPath)
app.use('/user', userRouter);
app.use('/admin', adminRouter)

app.use('/',express.static('./web'))

// 模板渲染
app.engine('html',require('express-art-template'));

app.use(function(req:any,res:any){
  res.send({data: {}, meta: { status: 404, msg: '404' }});
})

server.listen(port,'0.0.0.0',function() {
  console.log(`${new Date().toLocaleString()} - ` + `The server running ${port}...http://127.0.0.1:${port}`);
});