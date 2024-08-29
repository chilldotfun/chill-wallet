import { chains } from '../controller/network/config';
import { ChainItem } from '../service';

export interface ChainApiece {
  chain: string;
  apieceOfTime: number;
}
export const getChains = () => {
  const apt: Array<ChainApiece> = [];
  (chains() as Array<ChainItem>).map(v => {
    apt.push({
      chain: v.chain,
      apieceOfTime: v.apieceOfTime
    });
  });
  return apt;
};
export const ALL_CHAINS: Array<ChainApiece> = getChains();

export const MAX_DATA: number = 1;
export const QUERYBLOCKS: number = 2000;
