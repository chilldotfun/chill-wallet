import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { chromeStorage } from '@/popup/background';
import { WalletCache, WalletList } from '@/popup/background/service';
const walletList: WalletList[] = [];
const initialState: WalletCache = {
  createTime: 0,
  walletList,
  currentWalletId: 0,
  currentAccountId: 0,
  booted: '',
  walletBooted: {},
  isBooted: false,
  hasWallet: false,
  isUnlocked: false
};

const userSlice = createSlice({
  name: 'walletStore',
  initialState,
  reducers: {
    setWalletCache: (state, action: PayloadAction<WalletCache>) => {
      Object.assign(state, action.payload);
      chromeStorage.set('walletStore', action.payload);
    },
    setFetchWalletCache: (state, action: PayloadAction<WalletCache>) => {
      Object.assign(state, action.payload);
    }
  }
});

export const { setWalletCache, setFetchWalletCache } = userSlice.actions;
export default userSlice.reducer;
