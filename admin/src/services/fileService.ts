import axiosInstance from '@/utils/axios';
import { message } from 'antd';

export interface FileData {
  userId: string;
  originalName: string;
  size: number;
  mimeType: string;
  path: string;
  url: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface FilesResponse {
  status: string;
  message: string;
  data: FileData[];
}

export interface UploadResponse {
  status: string;
  message: string;
  data: FileData;
}

export const uploadFile = async (file: File | FormData): Promise<UploadResponse | null> => {
  let formData: FormData;
  if (file instanceof FormData) {
    formData = file;
  } else {
    formData = new FormData();
    formData.append('file', file);
  }

  try {
    const { data } = await axiosInstance.post<UploadResponse>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  } catch (error) {
    message.error('文件上传失败');
    return null;
  }
};

export const deleteFile = async (fileId: string): Promise<boolean> => {
  try {
    await axiosInstance.delete(`/upload/${fileId}`);
    message.success('文件删除成功');
    return true;
  } catch (error) {
    message.error('文件删除失败');
    return false;
  }
}; 

export const getUserFiles = async (): Promise<FilesResponse| null> => {
  try {
    const { data } = await axiosInstance.get<FilesResponse>('/upload');
    return data;
  } catch (error) {
    message.error('获取文件列表失败');
    return null;
  }
};