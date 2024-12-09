import { FileData } from "@/services/fileService";

// 登录响应数据
export interface LoginResponse {
  message: string;
  status: string;
  data: LoginSuccessResponse;
}
// 登陆请求数据
export interface LoginRequest {
 email: string;
  password: string;
}

export interface UserLoginData {
  id: string;
  role: 'admin' | 'user';
  username: string;
  email: string;
  status: 'active' | 'inactive';
}

// 登陆成功返回数据
export interface LoginSuccessResponse {
  token: string;
  user: UserLoginData;
}

// 用户列表相关类型
export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// 用户状态
export interface UserState {
  users: User[];
  total: number;
  loading: boolean;
  error: string | null;
}

// 用户查询参数
export interface UserQueryParams {
  page?: number;
  limit?: number;
  username?: string;
  email?: string;
  status?: string;
  role?: 'admin' | 'user';
}

// 用户响应数据
export interface UserResponse {
  status: string;
  data: {
    users: User[];
    total: number;
  };
}

// 创建用户请求数据
export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}

// 更新用户请求数据
export interface UpdateUserRequest {
  username?: string;
  email?: string;
  role?: 'admin' | 'user';
  status?: 'active' | 'inactive';
}

// 用户操作响应
export interface UserOperationResponse {
  status: string;
  message: string;
  data?: {
    user: User;
    token?: string;
  };
}

// 新闻类型
export interface News {
  _id: string;
  title: string;
  content: string;
  cover: FileData | null;
  category: string;
  status: 'draft' | 'published';
  author: {
    _id: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

// 新闻状态
export interface NewsState {
  news: News[];
  categories: Category[];
  total: number;
  loading: boolean;
  error: string | null;
}

// 新闻查询参数
export interface NewsQueryParams {
  page?: number;
  limit?: number;
  title?: string;
  category?: string;
  author?: string;
  status?: string;
}

// 新闻响应数据
export interface NewsResponse {
  status: string;
  data: {
    news: News[];
    pagination: {
      total: number;
      page: number;
      pages: number;
    };
  };
}

// 创建新闻请求
export interface CreateNewsRequest {
  title: string;
  content: string;
  category: string;
  status: 'draft' | 'published';
  cover?: FileData | null;
}

// 更新新闻请求
export interface UpdateNewsRequest {
  title?: string;
  content?: string;
  category?: string;
  status?: 'draft' | 'published';
  cover?: FileData | null;
}
// 创建新闻操作响应
export interface CreateNewsOperationResponse {
  status: string;
  message: string;
  data?: News;
}

//  更新新闻操作响应
export interface NewsOperationResponse {
  status: string;
  message: string;
  data?: {
    news: News;
  };
} 
// 分类类型
export interface Category {
  _id: string;
  name: string;
  createdBy: {
    _id: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

// 分类响应数据
export interface CategoryResponse {
  status: string;
  data: {
    categories: Category[];
    pagination: {
      total: number;
      page: number;
      pages: number;
    };
  };
}

// 分类操作响应
export interface CategoryOperationResponse {
  status: string;
  message: string;
  data?: {
    category: Category;
  };
}

// 人才类型
export interface Talent {
  _id: string;
  name: string;
  position: string;
  avatar?: FileData | null;
  summary: string;
  skills: string[];
  workExperience: string;
  education: string;
  contact: string;
  status: 'available' | 'not-available';
  featured: boolean;
  recommendedBy: {
    _id: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

// 人才状态
export interface TalentState {
  talents: Talent[];
  total: number;
  loading: boolean;
  error: string | null;
}

// 人才查询参数
export interface TalentQueryParams {
  page?: number;
  limit?: number;
  keyword?: string;
  skills?: string;
  status?: string;
  featured?: boolean;
}

// 人才响应数据
export interface TalentResponse {
  status: string;
  data: {
    talents: Talent[];
    pagination: {
      total: number;
      page: number;
      pages: number;
    };
  };
}

// 创建人才请求
export interface CreateTalentRequest {
  name: string;
  position: string;
  summary: string;
  skills: string[];
  workExperience: string;
  education: string;
  contact: string;
  avatar?: FileData | null;
}

// 更新人才请求
export interface UpdateTalentRequest {
  name?: string;
  position?: string;
  summary?: string;
  skills?: string[];
  workExperience?: string;
  education?: string;
  contact?: string;
  status?: 'available' | 'not-available';
  avatar?: FileData | null;
}

// 人才操作响应
export interface TalentOperationResponse {
  status: string;
  message: string;
  data?: {
    talent: Talent;
  };
}

// 就业资讯类型
export interface Employment {
  _id: string;
  title: string;
  content: string;
  source: string;
  category: 'employment_news' | 'employment_policy';
  tag: 'important' | 'job' | 'startup' | 'national_policy' | 'local_policy';
  status: 'draft' | 'published';
  author: {
    _id: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
  cover: FileData | null;
}

// 就业资讯状态
export interface EmploymentState {
  employments: Employment[];
  total: number;
  loading: boolean;
  error: string | null;
}

// 就业资讯查询参数
export interface EmploymentQueryParams {
  page?: number;
  limit?: number;
  title?: string;
  category?: string;
  tag?: string;
  status?: string;
}

// 就业资讯响应数据
export interface EmploymentResponse {
  status: string;
  data: {
    employments: Employment[];
    pagination: {
      total: number;
      page: number;
      pages: number;
    };
  };
}

// 创建就业资讯请求
export interface CreateEmploymentRequest {
  title: string;
  content: string;
  source: string;
  category: 'employment_news' | 'employment_policy';
  tag: 'important' | 'job' | 'startup' | 'national_policy' | 'local_policy';
  status: 'draft' | 'published';
  cover?: FileData | null;
}

// 更新就业资讯请求
export interface UpdateEmploymentRequest {
  title?: string;
  content?: string;
  source?: string;
  category?: 'employment_news' | 'employment_policy';
  tag?: 'important' | 'job' | 'startup' | 'national_policy' | 'local_policy';
  status?: 'draft' | 'published';
  cover?: FileData | null;
}

// 就业资讯操作响应
export interface EmploymentOperationResponse {
  status: string;
  message: string;
  data?: {
    employment: Employment;
  };
}