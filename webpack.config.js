// 引入一个包
const path = require('path')
// 引入clean 插件 打包时先清除dist目录
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const nodeExternals = require('webpack-node-externals');
// 修改代码自动重启服务器
const NodemonPlugin = require('nodemon-webpack-plugin')

const { NOOE_ENV = 'production' } = process.env

module.exports = {
    mode: NOOE_ENV, // 开发环境
    target: 'node',
    // 指定入口文件
    entry: './app.ts',
    // 指定打包文件所在的目录
    output: {
        // 指定打包目录
        path: path.resolve(__dirname, 'dist'),
        // 打包后文件的名字
        filename: 'main.js',
        // // 告诉webpack不使用箭头函数
        // environment: {
        //     arrowFunction: false
        // }
    },
    // 用来设置引用模块
    resolve: {
        extensions: ['.ts', '.js']
    },
    // 指定webpack 打包时要使用的模块
    module: {
        // 指定加载规则
        rules: [
            {
                // test 指定规则生效的文件
                test: /\.ts$/,
                // 要使用的loadder
                use: [
                    'ts-loader'
                ],
                // 要排除的文件
                exclude: /node_modules/
                
            },
            // 指定less 文件的处理
            {
                test: /\.less$/,
                use: ['style-loader','css-loader','less-loader']   
            }
        ]
    },
    // 配置wenpack插件
    plugins: [
        // 打包前删除dist目录
        new CleanWebpackPlugin(),
        new NodemonPlugin()
    ],
    externals: [ nodeExternals() ],
    watch: NOOE_ENV === 'development'
}