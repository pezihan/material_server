const token = require('jsonwebtoken')

module.exports = {
    en(obj:object) { // 加密token
        let tokenKey = token.sign(obj,'pezihan');
        return tokenKey
    },
    de(tokenkey:string) { // 解密token
        try{
            const data = token.verify(tokenkey,'pezihan')
            return {
                status: 'success',
                data
            }
        } catch {
            return {
                status: 'error',
                data: {}
            }
        }
    }
}
