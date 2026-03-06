
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const consoleSlice = createSlice({
  name: 'console',
  initialState: {
    scrollOffset: 0,
  },

  reducers: {
    scrollTo(state, action) {
      state.scrollOffset = action.payload.offset;
    },
  },
});
