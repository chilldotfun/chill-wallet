export interface AssetsItem {
  chainId: number;
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  projectName: string;
  tokenImgUrl?: string;
  tokenDecimals?: number;
  soldAmount?: number;
  investedAmount?: number;
  remainAmount?: number;
  balanceMo?: string;
  usdtToWeiMo?: string;
  usdtToVal?: string;
  originalPosition?: string;
  isOriginalCoin?: boolean;
  priceUsd?: number;
  liquidity?: number;
  fdv?: number;
}
export interface TokenCacheType {
  accountId?: string;
  balanceMo?: string;
  chainId?: number;
  hide?: boolean;
  chainName?: string;
  id: string;
  isOriginalCoin?: boolean;
  investedAmount?: number;
  investedValue?: number;
  only_key?: string;
  originalPosition?: string;
  quoteAmount?: string;
  remainAmount?: string;
  soldAmount?: number;
  soldValue?: string;
  tokenAddress?: string;
  tokenDecimals?: number;
  tokenImgUrl?: string;
  tokenName?: string;
  tokenSymbol?: string;
  walletAddress?: string;
  usdtToWeiMo?: string;
}
