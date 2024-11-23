import CryptoJS from 'crypto-js';

// 从环境变量获取密钥，如果没有则使用默认值
const CRYPTO_KEY = process.env.REACT_APP_CRYPTO_KEY || 'your-secret-key-32chars-long!!!!!';

export const encrypt = (text: string): string => {
  try {
    // 使用 AES 加密
    const encrypted = CryptoJS.AES.encrypt(text, CRYPTO_KEY);
    return encrypted.toString();
  } catch (error) {
    console.error('Encryption error:', error);
    return '';
  }
};

export const decrypt = (encryptedText: string): string => {
  try {
    // 使用 AES 解密
    const decrypted = CryptoJS.AES.decrypt(encryptedText, CRYPTO_KEY);
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
};

// 生成随机盐值
export const generateSalt = (length: number = 16): string => {
  return CryptoJS.lib.WordArray.random(length).toString();
};

// 使用 PBKDF2 进行密码哈希
export const hashPassword = (password: string, salt: string): string => {
  return CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 1000
  }).toString();
};

// 验证密码
export const verifyPassword = (password: string, hash: string, salt: string): boolean => {
  const newHash = hashPassword(password, salt);
  return newHash === hash;
}; 