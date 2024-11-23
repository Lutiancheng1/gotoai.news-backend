import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/usersSlice';
import newsReducer from './slices/newsSlice';
import talentReducer from './slices/talentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    news: newsReducer,
    talent: talentReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 