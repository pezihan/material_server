module.exports = {
    // 随机数
    rand(min:number, max:number):number {
        return Math.floor(Math.random() * (max-min)) + min!;
    }
}