import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface IsLoginState {
  isLogin: boolean;
}

const initialState: IsLoginState = {
  isLogin: false,
};

export const isLoginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    setIsLogin: (state: IsLoginState, action: PayloadAction<boolean>) => {
      state.isLogin = action.payload;
    },
  },
});
export const { setIsLogin } = isLoginSlice.actions;

export default isLoginSlice.reducer;
