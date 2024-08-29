import { cachePair } from '@/popup/background/controller/cache/api';
import { quoteTokens } from '@/popup/background/controller/swap/config';

import { ChainItem } from '../../service';
import { chains } from '../network/config';
import chromeStorage from '../cache/chromeStorage';
import { fetchWebsites } from '@/api/https/common';

export interface URLSwapParams {
  isMarketWebsite: boolean;
  tokenAddress: string;
  pairAddress: string;
  chain: string;
  source: string;
  chainID: number;
}
export async function getSwapParams(urlString: string): Promise<URLSwapParams | null> {
  const url = new URL(urlString);
  const { origin, pathname } = url;

  const back = {
    pairAddress: '',
    tokenAddress: '',
    chain: '',
    chainID: 0,
    source: origin,
    isMarketWebsite: false
  };

  if (!pathname) return back;

  let { marketWebsites } = await chromeStorage.get('marketWebsites');
  if (!marketWebsites) {
    marketWebsites = await fetchWebsites();

    await chromeStorage.set('marketWebsites', marketWebsites);
  }

  marketWebsites.forEach(item => {
    if (urlString.includes(item.url)) {
      back.isMarketWebsite = true;
      back.chain = urlString.match(RegExp(item.chainNameExpr)) ? urlString.match(RegExp(item.chainNameExpr))![0] : '';

      if (item.addressType == 1) {
        back.tokenAddress = '';
        back.pairAddress = urlString.match(RegExp(item.addressExpr))
          ? urlString.match(RegExp(item.addressExpr))![0]
          : '';
      } else {
        back.tokenAddress = urlString.match(RegExp(item.addressExpr))
          ? urlString.match(RegExp(item.addressExpr))![0]
          : '';
        back.pairAddress = '';
      }
    }
  });

  if (!back.chain) return back;
  const chainItem = chains(back.chain) as ChainItem;

  if (chainItem.chainID) back.chainID = chainItem.chainID;
  back.chain = chainItem.chain;

  return back;
}
