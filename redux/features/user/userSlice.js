import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.status = 'succeeded';
      state.error = null;
    },
    clearUser: (state) => {
      state.user = null;
      state.status = 'idle';
      state.error = null;
    },
    setUserLoading: (state) => {
      state.status = 'loading';
      state.error = null;
    },
    setUserError: (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    },
  },
});

export const {
  setUser,
  clearUser,
  setUserLoading,
  setUserError,
} = userSlice.actions;

export default userSlice.reducer;
