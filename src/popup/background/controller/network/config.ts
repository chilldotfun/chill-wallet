import { environmental } from '@/utils/index';
export const ethRpcKey: string = '952c535fa7d7487a80eb600457d80ea0';
export const defaultChain: string = 'ETH';
export const defaultChainID: number = 1;

// Configure your PRC
export const defaultChainRpc = {
  ETH: [],
  BASE: [],
  SOLANA: []
};

import { baseTokens, ethTokens, solTokens } from '@/popup/background/controller/swap/config';
import { ChainItem } from '@/popup/background/service';

const deTrades = {
  ETH: environmental(
    '0xe9B034cc80F7165c173aF212752aBF42f590C83B',
    '0xe9B034cc80F7165c173aF212752aBF42f590C83B',
    '0xe9B034cc80F7165c173aF212752aBF42f590C83B'
  ),
  BASE: environmental(
    '0x8D349A8a122b14a5fDd7f8AEe085AD47605395D8',
    '0x8D349A8a122b14a5fDd7f8AEe085AD47605395D8',
    '0x8D349A8a122b14a5fDd7f8AEe085AD47605395D8'
  )
};

export function chains(chain?: string | number): ChainItem | ChainItem[] {
  const chains: ChainItem[] = [
    {
      chainName: 'Solana',
      chain: 'SOLANA',
      dexscreenerChain: 'solana',
      aliasChain: ['SOL', 'SOLANA'],
      chainID: 102,
      token: 'SOL',
      tokens: solTokens,
      rpc: defaultChainRpc['SOLANA'],
      blockExplorerUrls: ['https://solscan.io'],
      blockExplorerName: 'Solscan',
      defaultPath: `m/44'/501'/0'/0`,
      swapName: 'Jupiter',
      deTrade: '',
      defaultLimit: 0,
      apieceOfTime: 2000
    },
    {
      chainName: 'Ethereum',
      chain: 'ETH',
      dexscreenerChain: 'ethereum',
      aliasChain: ['ETH', 'ETHEREUM', 'ETHER'],
      chainID: 1,
      token: 'ETH',
      tokens: ethTokens,
      rpc: defaultChainRpc['ETH'],
      blockExplorerUrls: ['https://etherscan.io'],
      blockExplorerName: 'Etherscan',
      defaultPath: `m/44'/60'/0'/0/0`,
      swapName: 'Uniswap',
      deTrade: deTrades['ETH'],
      defaultLimit: 500000,
      apieceOfTime: 12000
    },
    {
      chainName: 'Base',
      chain: 'BASE',
      dexscreenerChain: 'base',
      aliasChain: ['BASE'],
      chainID: 8453,
      token: 'ETH',
      tokens: baseTokens,
      rpc: defaultChainRpc['BASE'],
      blockExplorerUrls: ['https://basescan.org'],
      blockExplorerName: 'Basescan',
      defaultPath: `m/44'/60'/0'/0/0`,
      swapName: 'Uniswap',
      deTrade: deTrades['BASE'],
      defaultLimit: 500000,
      apieceOfTime: 2000
    }
  ];
  if (chain) {
    if (typeof chain === 'string') {
      const chainItem = chains.find(v => v.aliasChain.includes(chain.toUpperCase()));
      return chainItem as ChainItem;
    } else if (typeof chain === 'number') {
      const chainItem = chains.find(v => v.chainID === chain);
      return chainItem as ChainItem;
    } else {
      throw new Error(`Error chain: ${chain}`);
    }
  }
  return chains;
}

export const allChainNames = (chains() as Array<ChainItem>).map(v => v.chain);
export const allChainIds = (chains() as Array<ChainItem>).map(v => v.chainID);
export const getChainNameByChainId = (chainId: number) => {
  if (!chainId) return '';
  const index = allChainIds.findIndex(v => v === chainId);
  return allChainNames[index] || '';
};
export const getDexscreenerChainByChainId = (chainId: number) => {
  if (!chainId) return '';
  const index = allChainIds.findIndex(v => v === chainId);
  return (chains() as Array<ChainItem>)[index].dexscreenerChain || '';
};
export const getChainIdByDexscreenerChain = (dexscreenerChain: string) => {
  let chainID: string | number = '';
  (chains() as Array<ChainItem>).forEach(item => {
    if (item.dexscreenerChain == dexscreenerChain) {
      chainID = item.chainID;
    }
  });
  return chainID;
};
export const getChainTokenByChainId = (chainId: number) => {
  if (!chainId) return '';
  const index = (chains() as Array<ChainItem>).findIndex(v => v.chainID === chainId);
  return (chains() as Array<ChainItem>)[index].token || '';
};

export const getChainTokensByChainId = (chainId: number) => {
  if (!chainId) return [];
  const index = (chains() as Array<ChainItem>).findIndex(v => v.chainID === chainId);
  return (chains() as Array<ChainItem>)[index].tokens || [];
};

export const getChainTokenAddrByChainId = (chainId: number) => {
  if (!chainId) return '';
  const index = (chains() as Array<ChainItem>).findIndex(v => v.chainID === chainId);
  return (chains() as Array<ChainItem>)[index].tokens[0].address || '';
};

export const getChainTokenAddressByChainId = (chainId: number) => {
  if (!chainId) return '';
  const index = (chains() as Array<ChainItem>).findIndex(v => v.chainID === chainId);
  return (chains() as Array<ChainItem>)[index].tokens[1].address || '';
};

export const getChainIdByChainName = (chainName: string) => {
  const index = allChainNames.findIndex(v => v.toLowerCase() === chainName.toLowerCase());
  return allChainIds[index];
};
export const getChainNameByChain = (chain: string): string => {
  const item = chains(chain) as ChainItem;
  if (item) {
    return item.chainName;
  }
  return '--';
};

export const getChainExplorerByChainId = (chainId: number) => {
  if (!chainId) return '';
  const index = (chains() as Array<ChainItem>).findIndex(v => v.chainID === chainId);
  return (chains() as Array<ChainItem>)[index].blockExplorerUrls[0] || '';
};

export const getChainExplorerNameByChainId = (chainId: number) => {
  if (!chainId) return '';
  const index = (chains() as Array<ChainItem>).findIndex(v => v.chainID === chainId);
  return (chains() as Array<ChainItem>)[index].blockExplorerName || '';
};

export const getPrcs = () => {
  const rpcs = {};
  for (const key in chains() as Array<ChainItem>) {
    const chainItem = chains()[key];
    rpcs[chainItem.chain] = chainItem.rpc;
  }
  return rpcs;
};
