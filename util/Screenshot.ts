const exec = require('child_process').exec;

module.exports = {
    // 截取视频封面
    create (path: string, fileName: string) {
        return new Promise(async (resolve,reject)=> {
            await exec(`ffmpeg -ss 00:00:01 -i ${path}  -frames:v 1 -y ${fileName}`, async function(error: any, stdout: any, stderr: any) {
                if (error) {
                    console.log(error)
                    resolve(false)
                }
                console.log(stdout)
                resolve(fileName)
            })
        }).catch((err)=> {
            console.log(err);
        })
    }
}