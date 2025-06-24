import NodeRSA from 'node-rsa';
import * as fs from 'fs';
import * as path from 'path';

const publicKey = fs.readFileSync(path.join(__dirname,  '..', '..', '..', 'keys', 'public.pem'), 'utf-8');
const privateKey = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'keys', 'private.key'), 'utf-8');


export class RSAUtil {

    key: any;
    constructor() {
        this.key = new NodeRSA({ b: 1024 })
        this.key.setOptions({encryptionScheme: 'pkcs1'});
        this.key.importKey(publicKey);
        this.key.importKey(privateKey);
    }

    encrypt(data: string): string {
        const dataToEncrypt = Buffer.from(data, 'utf8');
        const encryptedBuffer = this.key.encrypt(dataToEncrypt, 'buffer');
        return encryptedBuffer.toString('base64');
    }

    decrypt(encryptedData: string): string {
        const encryptedBuffer = Buffer.from(encryptedData, 'base64');
        const decryptedBuffer = this.key.decrypt(encryptedBuffer);
        return decryptedBuffer.toString('utf8');
    }
}
