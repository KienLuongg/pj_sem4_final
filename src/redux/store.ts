import { configureStore } from '@reduxjs/toolkit';
import isLoginReducer from './slices/isLogin-slice';

export const store = configureStore({
  reducer: {
    isLogin: isLoginReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
