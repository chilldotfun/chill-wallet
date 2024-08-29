import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import stateReducer from './useAppStore';
import networkStore from './useAppStore/networkStore';
import walletStore from './useAppStore/walletStore';

const store = configureStore({
  reducer: {
    counter: stateReducer,
    walletStore,
    networkStore
  }
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export default store;
