import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/utils/axios';
import { 
  News, 
  NewsState, 
  NewsQueryParams, 
  NewsResponse,
  CreateNewsRequest,
  UpdateNewsRequest,
  NewsOperationResponse,
  Category,
  CategoryResponse,
  CategoryOperationResponse,
  CreateNewsOperationResponse
} from '@/types';

const initialState: NewsState = {
  news: [],
  categories: [],
  total: 0,
  loading: false,
  error: null,
};

// 获取新闻列表
export const fetchNews = createAsyncThunk<NewsResponse, NewsQueryParams>(
  'news/fetchNews',
  async (params) => {
    const response = await axiosInstance.get<NewsResponse>('/news', { params });
    return response.data;
  }
);

// 获取分类列表
export const fetchCategories = createAsyncThunk<Category[]>(
  'news/fetchCategories',
  async () => {
    const response = await axiosInstance.get<CategoryResponse>('/categories');
    return response.data.data.categories;
  }
);

// 创建新闻
export const createNews = createAsyncThunk<CreateNewsOperationResponse, CreateNewsRequest>(
  'news/createNews',
  async (newsData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<CreateNewsOperationResponse>('/news', newsData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 更新新闻
export const updateNews = createAsyncThunk<
  NewsOperationResponse,
  { id: string; data: UpdateNewsRequest }
>(
  'news/updateNews',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put<NewsOperationResponse>(`/news/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 删除新闻
export const deleteNews = createAsyncThunk<NewsOperationResponse, string>(
  'news/deleteNews',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete<NewsOperationResponse>(`/news/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 获取分页分类列表
export const fetchCategoriesWithPagination = createAsyncThunk<
  CategoryResponse,
  { page?: number; limit?: number; name?: string }
>(
  'news/fetchCategoriesWithPagination',
  async (params) => {
    const response = await axiosInstance.get<CategoryResponse>('/categories', { params });
    return response.data;
  }
);

// 创建分类
export const createCategory = createAsyncThunk<
  CategoryOperationResponse,
  { name: string }
>(
  'news/createCategory',
  async (data) => {
    const response = await axiosInstance.post<CategoryOperationResponse>('/categories', data);
    return response.data;
  }
);

// 更新分类
export const updateCategory = createAsyncThunk<
  CategoryOperationResponse,
  { id: string; name: string }
>(
  'news/updateCategory',
  async ({ id, name }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put<CategoryOperationResponse>(`/categories/${id}`, { name });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

// 删除分类
export const deleteCategory = createAsyncThunk<CategoryOperationResponse, string>(
  'news/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete<CategoryOperationResponse>(`/categories/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // 获取新闻列表
      .addCase(fetchNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.loading = false;
        state.news = action.payload.data.news;
        state.total = action.payload.data.pagination.total;
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取新闻列表失败';
      })
      // 获取分类列表
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload || [];
      })
      .addCase(fetchCategories.rejected, (state) => {
        state.categories = [];
      })
      // 创建新闻
      .addCase(createNews.fulfilled, (state, action) => {
        if (action.payload.data) {
          state.news.unshift(action.payload.data);
          state.total += 1;
        }
      })
      // 更新新闻
      .addCase(updateNews.fulfilled, (state, action) => {
        if (action.payload.data?.news) {
          const index = state.news.findIndex(
            item => item._id === action.payload.data?.news._id
          );
          if (index !== -1) {
            state.news[index] = action.payload.data.news;
          }
        }
      })
      // 删除新闻
      .addCase(deleteNews.fulfilled, (state, action) => {
        const id = action.meta.arg;
        state.news = state.news.filter(item => item._id !== id);
        state.total -= 1;
      })
      // 获取分页分类列表
      .addCase(fetchCategoriesWithPagination.fulfilled, (state, action) => {
        state.categories = action.payload.data.categories || [];
      })
      .addCase(fetchCategoriesWithPagination.rejected, (state) => {
        state.categories = [];
      })
      // 创建分类
      .addCase(createCategory.fulfilled, (state, action) => {
        if (action.payload.data?.category) {
          state.categories.unshift(action.payload.data.category);
        }
      })
      // 更新分类
      .addCase(updateCategory.fulfilled, (state, action) => {
        if (action.payload.data?.category) {
          const index = state.categories.findIndex(
            item => item._id === action.payload.data?.category._id
          );
          if (index !== -1) {
            state.categories[index] = action.payload.data.category;
            // 触发新闻列表刷新
            state.news = state.news.map(news => {
              if (news.category === action.payload.data?.category.name) {
                return { ...news, category: action.payload.data.category.name };
              }
              return news;
            });
          }
        }
      })
      // 删除分类
      .addCase(deleteCategory.fulfilled, (state, action) => {
        const id = action.meta.arg;
        state.categories = state.categories.filter(item => item._id !== id);
      });
  },
});

export default newsSlice.reducer;