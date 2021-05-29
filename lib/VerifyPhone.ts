module.exports = class verify {
    public codeArr:Array<{phone: number, code: number, time: number}> = []
    setCode (phone: number, code: number):void {
        const time:number = new Date().getTime() as number
        const index = this.codeArr.findIndex(v => v.phone === phone)
        if (index === -1) {
            this.codeArr.push({phone: phone, code:code, time: time})
        } else {
            this.codeArr[index].code = code
            this.codeArr[index].time = time
        }
    }
    getCode (phone: number): object {
        const index = this.codeArr.findIndex(v => v.phone === phone)
        return index === -1 ? {phone: null, code: null, time: null} : this.codeArr[index]
    }
}