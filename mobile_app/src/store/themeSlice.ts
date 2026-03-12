import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../constants';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
}

const initialState: ThemeState = {
  mode: 'light',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
      storage.set(STORAGE_KEYS.THEME, action.payload);
    },
    loadTheme(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
    },
  },
});

export const { setThemeMode, loadTheme } = themeSlice.actions;
export default themeSlice.reducer;
