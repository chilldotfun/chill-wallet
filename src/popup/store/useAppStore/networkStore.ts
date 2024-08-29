import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { defaultChain as useChain } from '@/popup/background/controller/network/config';
import { chains } from '@/popup/background/controller/network/config';
export const defaultChain = useChain;

import { chromeStorage } from '@/popup/background';
import { ChainItem, NetworkStore } from '@/popup/background/service';

const initialState: NetworkStore = {
  currentChain: chains(defaultChain) as ChainItem,
  chains: chains() as ChainItem[]
};

const userSlice = createSlice({
  name: 'networkStore',
  initialState,
  reducers: {
    setNetworkCache: (state, action: PayloadAction<NetworkStore>) => {
      Object.assign(state, action.payload);
      chromeStorage.set('networkStore', action.payload);
    },
    setFetchNetworkCache: (state, action: PayloadAction<NetworkStore>) => {
      Object.assign(state, action.payload);
    }
  }
});

export const { setNetworkCache, setFetchNetworkCache } = userSlice.actions;
export default userSlice.reducer;
