import { FaceChromeStore, ConnectParames } from './types';
import { createSlice } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    isUnlocked: false,
    chromeStore: {} as FaceChromeStore,
    language: 'zhCN',
    fromPath: '', // Router back use
    passWord: '',
    popupParames: {
      pairAddress: '',
      chain: ''
    } as ConnectParames,
    theme: 'dark'
  },
  reducers: {
    increment: (state, action: { type: string; payload: any }) => {
      switch (action.payload.type) {
        case 'isUnlocked':
          return { ...state, isUnlocked: action.payload.value };
        case 'chromeStore':
          let chromeStore = { ...state, chromeStore: action.payload.value };
          return chromeStore;
        case 'language':
          return { ...state, language: action.payload.value };
        case 'fromPath':
          return { ...state, fromPath: action.payload.value };
        case 'popupParames':
          return { ...state, popupParames: action.payload.value };
        case 'passWord':
          return { ...state, passWord: action.payload.value };
        default:
          return state;
      }
    },
    decrement: (state, action: { type: string; payload: any }) => {
      switch (action.payload.type) {
        case 'isUnlocked':
          return { ...state, isUnlocked: action.payload.value };
        case 'chromeStore':
          let chromeStore = { ...state, chromeStore: action.payload.value };
          return chromeStore;
        case 'language':
          return { ...state, language: action.payload.value };
        case 'fromPath':
          return { ...state, fromPath: action.payload.value };
        case 'popupParames':
          return { ...state, popupParames: action.payload.value };
        case 'passWord':
          return { ...state, passWord: action.payload.value };
        default:
          return state;
      }
    }
  }
});
export const { increment, decrement } = counterSlice.actions;
export default counterSlice.reducer;
