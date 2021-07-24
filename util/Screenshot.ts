const exec = require('child_process').exec;
var fs = require('fs')

module.exports = {
    // 截取视频封面
    create (path: string, fileName: string) {
        return new Promise(async (resolve,reject)=> {
            await exec(`ffmpeg -ss 00:00:01 -i ${path} -frames:v 1 -y ${fileName}.jpg`, async function(error: any, stdout: any, stderr: any) {
                if (error) {
                    console.log(error)
                    resolve(false)
                }
                console.log(stdout)
                resolve(fileName)
                // 删除图片视频后缀
                fs.rename(path, path.substring(0, path.lastIndexOf('.')), (err: any) => { if (err) { console.log('重命名失败') }})
                fs.rename(fileName + '.jpg', fileName, (err: any) => { if (err) { console.log('重命名失败') }})
            })
        }).catch((err)=> {
            console.log(err);
        })
    }
}