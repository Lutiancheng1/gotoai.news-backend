import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/utils/axios';
import { 
  Talent, 
  TalentState, 
  TalentQueryParams, 
  TalentResponse,
  CreateTalentRequest,
  UpdateTalentRequest,
  TalentOperationResponse 
} from '@/types';

const initialState: TalentState = {
  talents: [],
  total: 0,
  loading: false,
  error: null,
};

// 获取人才列表
export const fetchTalents = createAsyncThunk<TalentResponse, TalentQueryParams>(
  'talent/fetchTalents',
  async (params) => {
    const response = await axiosInstance.get<TalentResponse>('/talents', { params });
    return response.data;
  }
);

// 创建人才
export const createTalent = createAsyncThunk<TalentOperationResponse,CreateTalentRequest>(
  'talent/createTalent',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<TalentOperationResponse>('/talents', params );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 更新人才
export const updateTalent = createAsyncThunk<
  TalentOperationResponse,
  { id: string; params: UpdateTalentRequest }
>(
  'talent/updateTalent',
  async ({ id, params }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put<TalentOperationResponse>(`/talents/${id}`, params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 删除人才
export const deleteTalent = createAsyncThunk<TalentOperationResponse, string>(
  'talent/deleteTalent',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete<TalentOperationResponse>(`/talents/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 切换推荐状态
export const toggleFeatured = createAsyncThunk<
  TalentOperationResponse,
  { id: string; featured: boolean }
>(
  'talent/toggleFeatured',
  async ({ id, featured }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch<TalentOperationResponse>(
        `/talents/${id}/featured`,
        { featured }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

const talentSlice = createSlice({
  name: 'talent',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // 获取人才列表
      .addCase(fetchTalents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTalents.fulfilled, (state, action) => {
        state.loading = false;
        state.talents = action.payload.data.talents;
        state.total = action.payload.data.pagination.total;
      })
      .addCase(fetchTalents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取人才列表失败';
      })
      // 创建人才
      .addCase(createTalent.fulfilled, (state, action) => {
        if (action.payload.data?.talent) {
          state.talents.unshift(action.payload.data.talent);
          state.total += 1;
        }
      })
      // 更新人才
      .addCase(updateTalent.fulfilled, (state, action) => {
        if (action.payload.data?.talent) {
          const index = state.talents.findIndex(
            item => item._id === action.payload.data?.talent._id
          );
          if (index !== -1) {
            state.talents[index] = action.payload.data.talent;
          }
        }
      })
      // 删除人才
      .addCase(deleteTalent.fulfilled, (state, action) => {
        const id = action.meta.arg;
        state.talents = state.talents.filter(item => item._id !== id);
        state.total -= 1;
      })
      // 切换推荐状态
      .addCase(toggleFeatured.fulfilled, (state, action) => {
        if (action.payload.data?.talent) {
          const index = state.talents.findIndex(
            item => item._id === action.payload.data?.talent._id
          );
          if (index !== -1) {
            state.talents[index] = action.payload.data.talent;
          }
        }
      });
  },
});

export default talentSlice.reducer; 