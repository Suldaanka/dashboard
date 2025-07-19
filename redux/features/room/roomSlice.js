"use client";

import { createSlice } from '@reduxjs/toolkit';


export const roomSlice = createSlice({
  
  name: 'room',
  initialState: {
    room: null
  },
  reducers: {
    setRoom: (state, action) => {
      state.room = action.payload;
    },
  },
});


export const { setRoom } = roomSlice.actions;


export default roomSlice.reducer;
