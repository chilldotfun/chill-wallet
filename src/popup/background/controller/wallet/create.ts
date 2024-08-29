import { Keypair } from '@solana/web3.js';
import * as bip39 from 'bip39';
import bs58 from 'bs58';
import { derivePath } from 'ed25519-hd-key';
import { ethers } from 'ethers';

import { AccountItem, WalletList } from '@/popup/background/service';

import { ADDRESS_PATH_TYPE, ENCRYPTION_NAME } from './config';
import { ETH_SERIES } from '../swap/config';
import passworder from '../browser/passworder';
import chromeStorage from '../cache/chromeStorage';
import store from '@/popup/store';
import { setWalletCache } from '@/popup/store/useAppStore/walletStore';
import { deepCopy, getCurrentBlock } from '../utils';

export async function createByMnemonicFun(mnemonic: string, path: string, pathIndex: number, chainName: string) {
  const hdNode = ethers.utils.HDNode.fromMnemonic(mnemonic);
  const wallet = hdNode.derivePath(path);
  const { address, privateKey, publicKey } = wallet;
  const block = 0; // await getCurrentBlock(chainName);
  return <AccountItem>{
    pathIndex,
    path,
    address,
    publicKey,
    privateKey,
    chain: chainName,
    block
  };
}

export async function createByMnemonic(mnemonic: string, chainName: string, pathIndex: number = 0) {
  let path = ADDRESS_PATH_TYPE[chainName];
  if (pathIndex) {
    path = path.replace(/\/0$/, `/${pathIndex}`);
  }
  return {
    path,
    pathIndex,
    mnemonic,
    ETH: async (mnemonic: string, path: string, pathIndex: number, chainName: string) => {
      return await createByMnemonicFun(mnemonic, path, pathIndex, chainName);
    },
    BASE: async (mnemonic: string, path: string, pathIndex: number, chainName: string) => {
      return await createByMnemonicFun(mnemonic, path, pathIndex, 'BASE');
    },
    ARBITRUM: async (mnemonic: string, path: string, pathIndex: number, chainName: string) => {
      return await createByMnemonicFun(mnemonic, path, pathIndex, 'ARBITRUM');
    },
    BSC: async (mnemonic: string, path: string, pathIndex: number, chainName: string) => {
      return await createByMnemonicFun(mnemonic, path, pathIndex, 'BSC');
    },
    SEPOLIA: async (mnemonic: string, path: string, pathIndex: number, chainName: string) => {
      return await createByMnemonicFun(mnemonic, path, pathIndex, 'SEPOLIA');
    },
    SOLANA: async (mnemonic: string, path: string, pathIndex: number) => {
      const newPath = `${path}'`;
      const seed = bip39.mnemonicToSeedSync(mnemonic);
      const derivedKey = derivePath(newPath, seed.toString('hex')).key;
      const keypair = Keypair.fromSeed(derivedKey);
      const publicKey = keypair.publicKey.toString();
      const secretKey = bs58.encode(Buffer.from(keypair.secretKey));

      return <AccountItem>{
        pathIndex,
        path: newPath,
        address: publicKey,
        publicKey,
        privateKey: secretKey,
        chain: 'SOL',
        block: 0
      };
    }
  };
}

export function getPublicKey(privateKey: string) {
  const walletPrivate = new ethers.Wallet(privateKey);
  return walletPrivate.publicKey;
}

export async function generatePrivateKeyByChain(
  privateKey: string,
  chainName: string
): Promise<{
  address: string;
  outPrivateKey: string;
  publicKey: string;
  block: number;
}> {
  let account = {
    address: '',
    outPrivateKey: '',
    publicKey: '',
    block: 0
  };
  if (chainName === 'SOLANA') {
    const restoredEthWallet = new ethers.Wallet(privateKey);
    const restoredEthPrivateKeyArray = Uint8Array.from(Buffer.from(restoredEthWallet.privateKey.slice(2), 'hex'));
    const restoredSolanaKeypair = Keypair.fromSeed(restoredEthPrivateKeyArray.slice(0, 32));
    const restoredSolanaPrivateKey = restoredSolanaKeypair.secretKey;
    const restoredSolanaPrivateKeyBase58 = bs58.encode(restoredSolanaPrivateKey);
    const restoredSolanaAddress = restoredSolanaKeypair.publicKey.toBase58();
    account = {
      address: restoredSolanaAddress,
      publicKey: restoredSolanaAddress,
      outPrivateKey: restoredSolanaPrivateKeyBase58,
      block: 0
    };
  }
  if (ETH_SERIES.indexOf(chainName.toUpperCase()) !== -1) {
    const solanaPrivateKeyArray = bs58.decode(privateKey);
    const keypair = Keypair.fromSecretKey(solanaPrivateKeyArray);
    const solanaPrivateKey = keypair.secretKey.slice(0, 32);
    const ethPrivateKeyBuffer = Buffer.from(solanaPrivateKey);
    const ethWallet = new ethers.Wallet(ethPrivateKeyBuffer);
    const ethAddress = ethWallet.address;
    const ethPrivateKey = ethWallet.privateKey;
    const block = 0; // await getCurrentBlock(chainName);
    account = {
      address: ethAddress,
      outPrivateKey: ethPrivateKey,
      publicKey: getPublicKey(ethPrivateKey),
      block
    };
  }
  return account;
}

async function createEthSeriesPrivateKey(privateKey: string, key: string, chain: string, chainName: string) {
  if (key === chain) {
    if (!privateKey.startsWith('0x')) {
      privateKey = '0x' + privateKey;
    }
    const block = 0; // await getCurrentBlock(chainName);
    const wallet = new ethers.Wallet(privateKey);
    const { address, publicKey } = wallet;
    return <AccountItem>{
      pathIndex: 0,
      path: '',
      address,
      publicKey,
      privateKey,
      chain: chainName,
      block
    };
  } else {
    const { address, publicKey, outPrivateKey, block } = await generatePrivateKeyByChain(privateKey, key);
    return <AccountItem>{
      pathIndex: 0,
      path: '',
      address,
      publicKey,
      privateKey: outPrivateKey,
      chain: chainName,
      block
    };
  }
}

export async function createByPrivate() {
  return {
    ETH: async (privateKey: string, key: string, chain: string) => {
      return await createEthSeriesPrivateKey(privateKey, key, chain, 'ETH');
    },
    BASE: async (privateKey: string, key: string, chain: string) => {
      return await createEthSeriesPrivateKey(privateKey, 'ETH', chain, 'BASE');
    },
    ARBITRUM: async (privateKey: string, key: string, chain: string) => {
      return await createEthSeriesPrivateKey(privateKey, 'ETH', chain, 'ARBITRUM');
    },
    BSC: async (privateKey: string, key: string, chain: string) => {
      return await createEthSeriesPrivateKey(privateKey, 'ETH', chain, 'BSC');
    },
    SEPOLIA: async (privateKey: string, key: string, chain: string) => {
      return await createEthSeriesPrivateKey(privateKey, 'ETH', chain, 'SEPOLIA');
    },
    SOLANA: async (privateKey: string, key: string, chain: string) => {
      if (key === chain) {
        const decodedPrivateKey = bs58.decode(privateKey);
        const keypair = Keypair.fromSecretKey(decodedPrivateKey);
        const { publicKey } = keypair;
        const address = publicKey.toBase58();
        return {
          pathIndex: 0,
          path: '',
          privateKey,
          address,
          publicKey: address,
          chain,
          block: 0
        };
      } else {
        const chainName = 'SOLANA';
        const { address, publicKey, outPrivateKey, block } = await generatePrivateKeyByChain(privateKey, chainName);
        return <AccountItem>{
          pathIndex: 0,
          path: '',
          address,
          publicKey,
          privateKey: outPrivateKey,
          chain: chainName,
          block
        };
      }
    }
  };
}

export async function getEncryptionWallet(password, type, key): Promise<string> {
  const { walletBooted } = store.getState().walletStore || {};
  if (walletBooted) {
    const booted = walletBooted[`${ENCRYPTION_NAME[type]}${key.toLowerCase()}`];
    if (booted) {
      return await passworder.decrypt(password, booted);
    }
  }
  return '';
}

export async function setEncryptionWallet(password: string, way: number, key: string, value: string) {
  const { walletBooted } = store.getState().walletStore || {};

  const walletBootedCopy = deepCopy(walletBooted);
  const booted = await passworder.encrypt(password, value);
  walletBootedCopy[`${ENCRYPTION_NAME[way]}${key.toLowerCase()}`] = booted;
  await store.dispatch(setWalletCache({ ...store.getState().walletStore, walletBooted: walletBootedCopy }));
}
