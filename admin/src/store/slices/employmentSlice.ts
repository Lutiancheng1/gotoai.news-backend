import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '@/utils/axios';
import {
  CreateEmploymentRequest,
  EmploymentOperationResponse,
  EmploymentQueryParams,
  EmploymentResponse,
  UpdateEmploymentRequest
} from '@/types';

// 获取就业资讯列表(分页)
export const fetchEmployments = createAsyncThunk<
  EmploymentResponse,
  EmploymentQueryParams
>('employment/fetchEmployments', async (params) => {
  const response = await axiosInstance.get<EmploymentResponse>('/employment', { params });
  return response.data;
});

// 获取所有就业资讯(无分页)
export const fetchAllEmployments = createAsyncThunk<
  EmploymentResponse,
  EmploymentQueryParams
>('employment/fetchAllEmployments', async (params) => {
  const response = await axiosInstance.get<EmploymentResponse>('/employment/all', { params });
  return response.data;
});

// 创建就业资讯
export const createEmployment = createAsyncThunk<
  EmploymentOperationResponse,
  CreateEmploymentRequest
>('employment/createEmployment', async (data) => {
  const response = await axiosInstance.post<EmploymentOperationResponse>('/employment', data);
  return response.data;
});

// 更新就业资讯
export const updateEmployment = createAsyncThunk<
  EmploymentOperationResponse,
  { id: string; data: UpdateEmploymentRequest }
>('employment/updateEmployment', async ({ id, data }) => {
  const response = await axiosInstance.put<EmploymentOperationResponse>(`/employment/${id}`, data);
  return response.data;
});

// 删除就业资讯
export const deleteEmployment = createAsyncThunk<
  EmploymentOperationResponse,
  string
>('employment/deleteEmployment', async (id) => {
  const response = await axiosInstance.delete<EmploymentOperationResponse>(`/employment/${id}`);
  return response.data;
});

const employmentSlice = createSlice({
  name: 'employment',
  initialState: {
    employments: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    // 处理异步action
  }
});

export default employmentSlice.reducer;