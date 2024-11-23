import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/utils/axios';
import { 
  UserState, 
  UserQueryParams, 
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UserOperationResponse
} from '@/types';

const initialState: UserState = {
  users: [],
  total: 0,
  loading: false,
  error: null,
};

// 获取用户列表
export const fetchUsers = createAsyncThunk<UserResponse, UserQueryParams>(
  'user/fetchUsers',
  async (params) => {
    const response = await axiosInstance.get<UserResponse>('/users', { params });
    return response.data;
  }
);

// 创建用户
export const createUser = createAsyncThunk<UserOperationResponse, CreateUserRequest>(
  'user/createUser',
  async (userData) => {
    const response = await axiosInstance.post<UserOperationResponse>('/users', userData);
    return response.data;
  }
);

// 更新用户
export const updateUser = createAsyncThunk<
  UserOperationResponse,
  { id: string; data: UpdateUserRequest }
>(
  'user/updateUser',
  async ({ id, data }) => {
    const response = await axiosInstance.put<UserOperationResponse>(`/users/${id}`, data);
    return response.data;
  }
);

// 删除用户
export const deleteUser = createAsyncThunk<UserOperationResponse, string>(
  'user/deleteUser',
  async (id) => {
    const response = await axiosInstance.delete<UserOperationResponse>(`/users/${id}`);
    return response.data;
  }
);

// 切换用户状态
export const toggleUserStatus = createAsyncThunk<
  UserOperationResponse,
  string
>(
  'user/toggleStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch<UserOperationResponse>(
        `/users/${id}/toggle-status`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // 获取用户列表
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data.users;
        state.total = action.payload.data.total;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取用户列表失败';
      })
      // 创建用户
      .addCase(createUser.fulfilled, (state, action) => {
        if (action.payload.data?.user) {
          state.users.unshift(action.payload.data.user);
          state.total += 1;
        }
      })
      // 更新用户
      .addCase(updateUser.fulfilled, (state, action) => {
        if (action.payload.data?.user) {
          const index = state.users.findIndex(
            user => user._id === action.payload.data?.user._id
          );
          if (index !== -1) {
            state.users[index] = action.payload.data.user;
          }
        }
      })
      // 删除用户
      .addCase(deleteUser.fulfilled, (state, action) => {
        const id = action.meta.arg;
        state.users = state.users.filter(user => user._id !== id);
        state.total -= 1;
      })
      // 切换用户状态
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        if (action.payload.data?.user) {
          const index = state.users.findIndex(
            user => user._id === action.payload.data?.user._id
          );
          if (index !== -1) {
            state.users[index] = {
              ...state.users[index],
              status: action.payload.data.user.status
            };
          }
        }
      });
  },
});

export default userSlice.reducer;