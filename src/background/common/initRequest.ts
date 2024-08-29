import { fetchConfig, fetchWebsites } from '@/api/https/common';
import { fetchHolding } from '@/api/https/holding';
import { fetchUsdtToWei } from '@/api/https/price';
import { chromeStorage } from '@/popup/background';

import { chains } from '@/popup/background/controller/network/config';
import { ChainItem } from '@/popup/background/service';

const getWebsites = async () => {
  try {
    let websites = await fetchWebsites();
    if (websites) {
      await chrome.storage.local.set({ ['marketWebsites']: websites });
    }
  } catch (err) {}
};

export const getConfig = async () => {
  try {
    let config = await fetchConfig();
    if (config) {
      await chrome.storage.local.set({ ['chillConfigList']: config });
    }
    return true;
  } catch (error) {
    return false;
  }
};

const getToken = async () => {
  let config = await fetchHolding({ page: 1, size: 10, walletAddress: '', remainFlag: '' });
};

const getUsdtToWei = async () => {
  let chainList: any = chains();
  let chainJson = {};

  chainList.forEach(async (item, index) => {
    try {
    } catch (error) {}
  });
};

const init = async () => {
  getWebsites();
  getConfig();
};
export default init;
