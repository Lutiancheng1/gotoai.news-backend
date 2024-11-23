import { UserLoginData } from '@/types';
import CryptoJS from 'crypto-js';

const CREDENTIALS_KEY = 'admin_credentials';
const TOKEN_KEY = 'token';
const USER_KEY = 'user';

interface StoredCredentials {
  email: string;
  password: string;
}

interface AuthStorage {
  token: string | null;
  user: UserLoginData | null;
}

// 加密数据
const encryptData = (data: any): string => {
  return CryptoJS.AES.encrypt(
    JSON.stringify(data),
    process.env.REACT_APP_STORAGE_KEY || 'default-key'
  ).toString();
};

// 解密数据
const decryptData = (encryptedData: string): any => {
  try {
    const bytes = CryptoJS.AES.decrypt(
      encryptedData,
      process.env.REACT_APP_STORAGE_KEY || 'default-key'
    );
    const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedStr);
  } catch (e) {
    console.error('Decryption error:', e);
    return null;
  }
};

// 保存登录凭证
export const saveCredentials = (credentials: StoredCredentials): void => {
  try {
    const encryptedData = encryptData(credentials);
    localStorage.setItem(CREDENTIALS_KEY, encryptedData);
  } catch (error) {
    console.error('Error saving credentials:', error);
  }
};

// 获取存储的登录凭证
export const getStoredCredentials = (): StoredCredentials | null => {
  try {
    const encryptedData = localStorage.getItem(CREDENTIALS_KEY);
    if (!encryptedData) return null;
    
    const decryptedData = decryptData(encryptedData);
    if (!decryptedData) return null;

    return decryptedData as StoredCredentials;
  } catch (error) {
    console.error('Error getting credentials:', error);
    localStorage.removeItem(CREDENTIALS_KEY); // 清除无效数据
    return null;
  }
};

// 获取存储的认证信息
export const getStoredAuth = (): AuthStorage => {
  try {
    const encryptedToken = localStorage.getItem(TOKEN_KEY);
    const encryptedUser = localStorage.getItem(USER_KEY);
    
    const token = encryptedToken ? decryptData(encryptedToken) : null;
    const user = encryptedUser ? decryptData(encryptedUser) : null;
    
    return { token, user };
  } catch (e) {
    console.error('Error getting auth data:', e);
    clearStoredAuth();
    return {
      token: null,
      user: null
    };
  }
};

// 保存认证信息
export const setStoredAuth = (auth: AuthStorage): void => {
  try {
    if (auth.token) {
      const encryptedToken = encryptData(auth.token);
      localStorage.setItem(TOKEN_KEY, encryptedToken);
    }
    if (auth.user) {
      const encryptedUser = encryptData(auth.user);
      localStorage.setItem(USER_KEY, encryptedUser);
    }
  } catch (e) {
    console.error('Error saving auth data:', e);
  }
};

// 只清除token 和用户信息
export const clearTokenAndUser = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// 清除所有认证信息
export const clearStoredAuth = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(CREDENTIALS_KEY);
};

// 检查是否已认证
export const isAuthenticated = (): boolean => {
  try {
    const encryptedToken = localStorage.getItem(TOKEN_KEY);
    return !!encryptedToken && !!decryptData(encryptedToken);
  } catch (e) {
    return false;
  }
}; 