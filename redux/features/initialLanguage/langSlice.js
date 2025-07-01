// In store/languageSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Safe way to get localStorage value that works with SSR
const getStoredLanguage = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('language') || 'en';
  }
  return 'en';
};

export const languageSlice = createSlice({
  name: 'language',
  // This initial state will be overridden by our useEffect
  initialState: {
    current: 'en',
  },
  reducers: {
    toggleLanguage: (state) => {
      state.current = state.current === 'en' ? 'so' : 'en';
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', state.current);
      }
    },
    setLanguage: (state, action) => {
      state.current = action.payload;
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', state.current);
      }
    }
  }
});

export const { toggleLanguage, setLanguage } = languageSlice.actions;
export default languageSlice.reducer;