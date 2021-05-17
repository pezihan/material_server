var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const bodyParser = require('body-parser')
var adminRouter = require('./routes/admin')
var userRouter = require('./routes/user')
var app = express();
// 端口
const port = 4000;

// 改写
var http = require('http');
var server = http.createServer(app);

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//静态资源
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));


app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json());


app.use('/', function(req, res, next) {
  // 用户ip地址
  let login_ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddres || req.socket.remoteAddress || '';
  if(login_ip.split(',').length>0){
      login_ip = login_ip.split(',')[0];
  }
  console.log(`${new Date().toLocaleString()} - 请求方式：${req.method} - 请求路径：${req.path} - IP地址：${login_ip}`);
  next()
})
app.use('/user', userRouter);
app.use('/admin', adminRouter)

// 模板渲染
app.engine('html',require('express-art-template'));

server.listen(port,'0.0.0.0',function() {
  console.log(`${new Date().toLocaleString()} - ` + `The server running ${port}...`);
});