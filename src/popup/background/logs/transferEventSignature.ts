import { ethers, providers } from 'ethers';
import { network } from '..';
import { ALL_CHAINS, ChainApiece, MAX_DATA, QUERYBLOCKS } from './config';

export interface defalutChainLogConfig {
  chain: string;
  apieceOfTime: number;
  queryBlocks: number;
  beginTime: number;
  endTime: number;
  maxBackBlock: number;
  fromBlock: number;
  toBlock: number;
}
class TransferEvent {
  maxData: number;
  logParams: defalutChainLogConfig[] = [];
  constructor() {
    this.maxData = MAX_DATA;
    this.init();
  }
  async init() {
    for (const key in ALL_CHAINS) {
      const item = ALL_CHAINS[key];
      this.logParams.push({
        chain: item.chain,
        apieceOfTime: item.apieceOfTime,
        beginTime: 0,
        endTime: 0,
        queryBlocks: QUERYBLOCKS,
        maxBackBlock: this.getMaxBackBlock(item),
        fromBlock: 0,
        toBlock: 0
      });
    }
  }
  excute() {
    this.logParams.forEach(async item => {});
  }
  getMaxBackBlock(chainApiece: ChainApiece): number {
    const allSecond = this.maxData * 24 * 60 * 60;
    return Math.ceil(allSecond / chainApiece.apieceOfTime / 1000);
  }

  cacheBlock(chainApiece: ChainApiece, blockNumber: number) {}
}
