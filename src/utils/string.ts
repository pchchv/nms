import { createDecipheriv, createCipheriv,randomBytes } from 'crypto'
import { readFileSync, writeFileSync } from 'fs'

const chars   = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']
const numbers = ['0','1','2','3','4','5','6','7','8','9']
const symbols = ['@','#','&','$','.']
const algorithm = 'aes-256-cbc'
const key = randomBytes(32)
const iv = randomBytes(16)
const shuffle = (a: any[]): string => {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        [a[i], a[j]] = [a[j], a[i]]
    }
    return a.join('')
}
const hash = (str: string, length: number): string => {
    const array = str.split('').concat(chars).concat(numbers).concat(symbols)
    return shuffle(array).substr(0, length)
}
const base64Encode = (path: string): string => {
    const stream = readFileSync(path)
    return stream.toString('base64')
}
const base64Decode = (stream: Buffer, path: string): void => {
    const size = stream.toString('ascii').length
    writeFileSync(path, Buffer.alloc(size, stream, 'ascii'))
}
const decrypt = (cipherText: string): string => {
    const decipher = createDecipheriv(algorithm, key, iv)
    return decipher.update(cipherText, 'hex', 'utf8') + decipher.final('utf8')
}
const encrypt = (text: string): string => {
    const cipher = createCipheriv(algorithm, key, iv)
    return cipher.update(text, 'utf8', 'hex') + cipher.final('hex')
}
const filename = (name: string): string => {
    return name.lastIndexOf('.') !== -1 ? name.substring(0, name.lastIndexOf('.')) : name
}
const extension = (name: string, include = false): string => {
    return name.lastIndexOf('.') !== -1 ? include === true ? name.substring(name.lastIndexOf('.')) : name.substring(name.lastIndexOf('.') + 1) : name
}

export { base64Encode, base64Decode, decrypt, encrypt, extension, filename, hash, shuffle }