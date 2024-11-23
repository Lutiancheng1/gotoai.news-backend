import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserLoginData } from '@/types';
import { getStoredAuth, setStoredAuth, clearStoredAuth, isAuthenticated } from '@/utils/storage';

interface AuthState {
  token: string | null;
  user: UserLoginData | null;
  isAuthenticated: boolean;
}

const storedAuth = getStoredAuth();

const initialState: AuthState = {
  token: storedAuth.token,
  user: storedAuth.user,
  isAuthenticated: isAuthenticated()
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token: string; user: UserLoginData }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      setStoredAuth({
        token: action.payload.token,
        user: action.payload.user
      });
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      clearStoredAuth();
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer; 