import { getMint } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { Connection } from '@solana/web3.js';
import bs58 from 'bs58';
import { ethers, providers } from 'ethers';

import { network } from '..';
import abis from '../abis';
import { ChainItem } from '../service';
import { chains, getChainNameByChainId } from './network/config';
import uniswapController from './swap/uniswap';
import wallet from './wallet';
import { rejects } from 'assert';

export function fillZeroNumber(index: number) {
  return index < 10 ? `0${index}` : `${index}`;
}

export function numberToCharCode(num: number): string {
  if (num < 0) {
    throw new Error('The number must be greater than or equal to 0');
  }
  return String.fromCharCode(64 + num);
}

export function deepCopy(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  if (obj instanceof BigInt) {
    return BigInt(obj as bigint);
  }
  const newObj = Array.isArray(obj) ? [] : {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      newObj[key] = deepCopy(obj[key]);
    }
  }
  return newObj;
}

export function copyJson<T>(obj: T): T {
  let newObj = JSON.stringify(obj);
  newObj = JSON.parse(newObj);
  return newObj as T;
}

export function getAccountLogo(getId) {
  const id = Math.floor(Math.random() * 24);
  return `header_${id + 1}.png`;
}

export function isValidEthPrivateKey(key: string): boolean {
  if (key.startsWith('0x')) {
    key = key.slice(2);
  }
  const ethPrivateKeyRegex = /^[0-9a-fA-F]{64}$/;
  return ethPrivateKeyRegex.test(key);
}

export function isValidSolanaPrivateKey(key: string): boolean {
  try {
    bs58.decode(key);
    return true;
  } catch (error) {
    throw new Error('Invalid private key');
  }
}

export function whosePrivater(privateKey: string): string {
  if (isValidEthPrivateKey(privateKey)) {
    return getChainNameByChainId(1);
  }
  if (isValidSolanaPrivateKey(privateKey)) {
    return getChainNameByChainId(102);
  }
  throw new Error('Invalid private key');
}

export function findAndIncrementMax(arr: number[]): number {
  if (arr.length === 0) return 0;
  const max = Math.max(...arr);
  return max + 1;
}

export async function getTokenDecimals(chain: string | number, tokenAddress: string): Promise<number> {
  const provider = network.getProviderByChain(chain);
  let isSol = false;
  let chainName = chain;
  if (typeof chain === 'string') {
    isSol = chain === getChainNameByChainId(102);
  }
  if (typeof chain === 'number') {
    isSol = chain === 102;
    chainName = getChainNameByChainId(chain);
  }

  if (Object.entries(network.sysProviderRpcs).length === 0 && !network.sysProviderRpcs[chain]) {
    if (isSol) {
      const mintPublicKey = new PublicKey(tokenAddress);
      const mintInfo = await getMint(provider as Connection, mintPublicKey);
      const { decimals } = mintInfo;
      return decimals;
    }
    const tokenContract = new ethers.Contract(tokenAddress, abis.tokenABI, provider as providers.Provider);
    const decimals = await tokenContract.decimals();
    return decimals;
  } else {
    if (isSol) {
      const mintPublicKey = new PublicKey(tokenAddress);
      const profun = network.sysProviderRpcs[chainName].map(v => {
        return getMint(v as Connection, mintPublicKey).then(res => {
          return res;
        });
      });
      const mintInfo = await Promise.any(profun);
      const { decimals } = mintInfo;
      return decimals;
    }
    const profun = network.sysProviderRpcs[chainName].map(v => {
      const tokenContract = new ethers.Contract(tokenAddress, abis.tokenABI, v as providers.Provider);
      return tokenContract.decimals().then(res => {
        return res;
      });
    });
    const decimals = await Promise.any(profun);
    return decimals;
  }
}

export async function getCurrentBlock(chain: string | number): Promise<number> {
  const provider = network.getProviderByChain(chain);
  if (Object.entries(network.sysProviderRpcs).length === 0 && !network.sysProviderRpcs[chain]) {
    const blockNumber = await (provider as providers.Provider).getBlockNumber();
    return blockNumber;
  } else {
    const profun = network.sysProviderRpcs[chain].map(v => {
      return (v as providers.Provider).getBlockNumber().then(res => {
        return res;
      });
    });
    const blockNumber = await Promise.any(profun);
    return blockNumber;
  }
}

export async function bundlesStatuses(data) {
  const res = await (
    await fetch('https://mainnet.block-engine.jito.wtf/api/v1/bundles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getBundleStatuses',
        params: [[data]]
      })
    })
  ).json();

  if (res && res.result && res.result.value) {
    console.log('bundlesStatuses ===res', {
      context: res.result.context,
      value:
        res.result.value.length > 0
          ? { ...res.result.value[0], confirmationStatus: res.result.value[0].confirmation_status }
          : null
    });
    return {
      context: res.result.context,
      value:
        res.result.value.length > 0
          ? { ...res.result.value[0], confirmationStatus: res.result.value[0].confirmation_status }
          : null
    };
  } else {
    return {
      context: '',
      value: null
    };
  }
}

export async function getTradeStatus(chain: string | number, txHash: string, isSwap: boolean = false) {
  let isSol = false;
  let chainName = chain;
  if (typeof chain === 'string') {
    isSol = chain === getChainNameByChainId(102);
  }
  if (typeof chain === 'number') {
    isSol = chain === 102;
    chainName = getChainNameByChainId(chain);
  }

  if (isSol) {
    let tx = '';
    let boundId = '';
    if (txHash.indexOf('|') === -1) {
      tx = txHash;
    } else {
      const txArr: string[] = txHash.split('|');
      [tx, boundId] = txArr;
    }

    const confirmationPromises = network.sysProviderRpcs[chainName].map(v => {
      return (v as Connection).getSignatureStatus(tx, { searchTransactionHistory: !!isSwap }).then(res => {
        if (!res.value || (res.value && res.value.confirmationStatus === 'processed')) {
          Promise.reject('error');
        }
        return res;
      });
    });
    const confirmation = await Promise.any([...confirmationPromises, bundlesStatuses(boundId)]);

    return confirmation;
  } else {
    const profun = network.sysProviderRpcs[chainName].map(v => {
      return (v as providers.Provider).getTransaction(txHash).then(res => {
        return res;
      });
    });
    const tradeStatus = await Promise.any(profun);
    return tradeStatus;
  }
}
