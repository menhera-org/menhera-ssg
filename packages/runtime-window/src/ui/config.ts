
import { createSlice } from '@reduxjs/toolkit';
import { config } from '../app/config';

export const configSlice = createSlice({
  name: 'config',
  initialState: config,
  reducers: {},
});
