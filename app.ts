var express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser')
const adminRouter = require('./routes/admin')
const userRouter = require('./routes/user')
const verifyPath = require('./controllers/verify')
const cors = require('cors') // 跨域插件
const app = express();
// 端口
const port = 4000;


// 改写
const http = require('http');
const server = http.createServer(app);

app.use(cors()) // 挂载跨域插件
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//静态资源
app.use('/public', express.static(path.join(__dirname, '../public')));
app.use('/node_modules', express.static(path.join(__dirname, '../node_modules')));


app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json());


app.use('/', verifyPath)
app.use('/user', userRouter);
app.use('/admin', adminRouter)

// 模板渲染
app.engine('html',require('express-art-template'));

app.use(function(req:any,res:any){
  res.send({data: {}, meta: { status: 404, msg: '404' }});
})

server.listen(port,'0.0.0.0',function() {
  console.log(`${new Date().toLocaleString()} - ` + `The server running ${port}...`);
});