import { Connection } from '@solana/web3.js';
import { ErrorObject } from 'css-minimizer-webpack-plugin';
import { ethers, providers } from 'ethers';

import rpcServe from '@/popup/background/controller/cache/rpc';
import { ChainItem } from '@/popup/background/service';
import store from '@/popup/store';
import { setNetworkCache } from '@/popup/store/useAppStore/networkStore';

import swap from '../swap';
import { chains, defaultChainID, getChainIdByChainName, getChainNameByChainId, getPrcs } from './config';
import axios from 'axios';
import LoggingProvider from './provider';
import { getSolanaRpcHeard } from './utils';
import { cacheConfig } from '../cache/api';
import { Commitment } from '@solana/web3.js';

export interface ProvidersFace {
  [key: string]: providers.Provider | Connection;
}
export interface sysProviderRpcsFace {
  [key: string]: Array<providers.Provider | Connection | null>;
}
class NetworkController {
  network: ChainItem;
  myProviders: ProvidersFace;
  provider: providers.Provider | Connection;
  _sysProviderRpcs: sysProviderRpcsFace;
  rpcs: { [key: string]: Array<string> };
  constructor() {
    this.network = {} as ChainItem;
    this.myProviders = {};
    this.provider = this.getProvider() as any;
    this._sysProviderRpcs = {};
    this.rpcs = getPrcs();
    async () => {
      this.rpcs['SOLANA'] = await rpcServe.getChainRpcList('SOLANA');
    };
  }
  get sysProviderRpcs() {
    if (this._sysProviderRpcs['ETH'] === undefined || this._sysProviderRpcs['ETH'].length === 0) {
      for (const chain of Object.keys(this.rpcs)) {
        this._sysProviderRpcs[chain] = this.getChainProviderFromRpcs(chain);
      }
    } else {
      this._sysProviderRpcs['SOLANA'] = this.getChainProviderFromRpcs('SOLANA');
    }
    return this._sysProviderRpcs;
  }
  set sysProviderRpcs(value) {
    this._sysProviderRpcs = value;
  }

  choose(chain: string | number) {
    try {
      this.network = chains(chain) as ChainItem;
      swap.networkChange(this.network.chainID || defaultChainID);
      store.dispatch(setNetworkCache({ ...store.getState().networkStore, currentChain: this.network }));
      this.provider = this.getProvider(true) as any;
      return this.network;
    } catch (error) {
      throw new Error((error as ErrorObject).message || 'Network error');
    }
  }
  get(): ChainItem {
    return store.getState().networkStore.currentChain;
  }
  getProvider(reload = false): providers.Provider | Connection | Error {
    try {
      const rpc = rpcServe.rpc(this.network.chain) || this.network?.rpc[0];
      if (
        this.myProviders[this.network.chain.toLowerCase()] &&
        !reload &&
        this.network.chain.toLowerCase() !== 'solana'
      ) {
        this.provider = this.myProviders[this.network.chain.toLowerCase()];
        return this.provider;
      }
      if (this.network.chainID === 102) {
        this.provider = new Connection(rpc, {
          commitment: 'confirmed',
          httpHeaders: {
            'Content-Type': 'application/json',
            ...getSolanaRpcHeard()
          }
        });
        this.myProviders[this.network.chain.toLowerCase()] = this.provider;
        return this.provider;
      }
      this.provider = new LoggingProvider(rpc, this.network.chainID);
      this.myProviders[this.network.chain.toLowerCase()] = this.provider;
      return this.provider;
    } catch (error) {
      return new Error((error as Error).message || 'Network error');
    }
  }

  getProviderByChain(chain: string | number = this.network.chain): providers.Provider | Connection | Error {
    try {
      const currentChain = chains(chain) as ChainItem;
      const rpc = rpcServe.rpc(currentChain.chain) || currentChain?.rpc[0];
      let chainID = chain;
      if (typeof chain === 'string') {
        chainID = getChainIdByChainName(chain as string);
      }
      if (chainID === 102) {
        const currentProvider = new Connection(rpc, {
          commitment: 'confirmed',
          httpHeaders: {
            'Content-Type': 'application/json',
            ...getSolanaRpcHeard()
          }
        });
        return currentProvider;
      }
      const currentProvider = new LoggingProvider(rpc, chainID);
      return currentProvider;
    } catch (error) {
      return new Error((error as Error).message || 'Network error');
    }
  }

  getProviderByChainByRpc(chain: string | number, rpc: string): providers.Provider | Connection | null {
    try {
      let chainID = chain;
      if (typeof chain === 'string') {
        chainID = getChainIdByChainName(chain as string);
      }
      if (chainID === 102) {
        const currentProvider = new Connection(rpc, {
          commitment: 'confirmed',
          httpHeaders: {
            'Content-Type': 'application/json',
            ...getSolanaRpcHeard()
          }
        });
        return currentProvider;
      }
      const currentProvider = new LoggingProvider(rpc, chainID);
      return currentProvider;
    } catch (error) {
      return null;
    }
  }

  async getFastestProviderByChain(
    chain: string | number = this.network.chain,
    commitment: Commitment = 'confirmed'
  ): Promise<providers.Provider | Connection | Error> {
    try {
      const rpc = await this.getFastestRpc(chain);
      let chainID = chain;
      if (typeof chain === 'string') {
        chainID = getChainIdByChainName(chain as string);
      }
      if (chainID === 102) {
        const currentProvider = new Connection(rpc, {
          commitment: commitment,
          httpHeaders: {
            'Content-Type': 'application/json',
            ...getSolanaRpcHeard()
          }
        });
        return currentProvider;
      }
      const currentProvider = new LoggingProvider(rpc, chainID);
      return currentProvider;
    } catch (error) {
      return new Error((error as Error).message || 'Network error');
    }
  }

  async getFastestRpc(chain: string | number): Promise<string> {
    let method = 'eth_blockNumber';
    if (typeof chain === 'number') {
      chain = getChainNameByChainId(chain as number);
    }
    if (chain.toLowerCase() === 'SOLANA'.toLowerCase()) {
      method = 'getRecentBlockhash';
    }
    const rpcs = await rpcServe.getChainRpcList(chain as string);
    const testRpcSpeed = async url => {
      try {
        return await axios.post(
          url,
          { jsonrpc: '2.0', method, params: [], id: 1 },
          {
            headers: {
              'Content-Type': 'application/json',
              ...getSolanaRpcHeard()
            }
          }
        );
      } catch (error) {
        throw new Error((error as Error).message || 'Network error');
      }
    };
    const promises = rpcs.map(rpc => {
      return testRpcSpeed(rpc)
        .then(res => {
          if (res.status === 200 && res.data.id && !res.data.error) {
            Promise.resolve(rpc);
            return rpc;
          }
          throw new Error('Network error');
        })
        .catch(error => {
          throw new Error('Network error');
        });
    });
    const fasteRpc = await Promise.any(promises);
    return fasteRpc;
  }

  async rpcProviderInit() {
    for (const key in chains() as ChainItem[]) {
      const chainItem = chains()[key];
      const arr = await rpcServe.getChainRpcList(chainItem.chain as string);
      if (arr && arr.length > 0) {
        this.rpcs[chainItem.chain] = arr;
        const rpcp = this.getChainProviderFromRpcs(chainItem.chain);
        this._sysProviderRpcs[chainItem.chain] = rpcp;
      }
    }
    return this._sysProviderRpcs;
  }
  getChainProviderFromRpcs(chain: string) {
    const rpcp: Array<Connection | providers.Provider> = [];
    for (const rkey in this.rpcs[chain]) {
      const rpc = this.rpcs[chain][rkey];
      if (rpc) {
        const rProvider = this.getProviderByChainByRpc(chain, rpc);
        if (rProvider) {
          rpcp.push(rProvider);
        }
      }
    }

    return rpcp;
  }
}

export default new NetworkController();
