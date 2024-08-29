import { ethers } from 'ethers';
import EventEmitter from 'events';

import keysing from '@/background/keysing';
import { passworder } from '@/popup/background';
import { WalletAccount, WalletList } from '@/popup/background/service';
import store from '@/popup/store';
import { setWalletCache } from '@/popup/store/useAppStore/walletStore';

import { isValidSHA256, sha256 } from '../../utils';
import {
  deepCopy,
  findAndIncrementMax,
  getAccountLogo,
  isValidEthPrivateKey,
  isValidSolanaPrivateKey,
  numberToCharCode,
  whosePrivater
} from '../utils';
import { ADDRESS_PATH_TYPE, NAMES } from './config';
import { createByMnemonic, createByPrivate, getEncryptionWallet, setEncryptionWallet } from './create';

class WalletController extends EventEmitter {
  password: string;
  constructor() {
    super();
    this.password = '';
  }

  async createPassword(password: string): Promise<void> {
    if (password.length >= 256) {
      throw new Error(JSON.stringify({ code: 10000, message: 'Wrong, < 256 Characters!' }));
    }
    this.password = await sha256(password);
    const booted = await passworder.encrypt(this.password, 'true');
    await store.dispatch(setWalletCache({ ...store.getState().walletStore, booted, isUnlocked: true, isBooted: true }));
    keysing.booted(this.password);
  }

  async resetPassword(oldPassword: string, password: string): Promise<boolean> {
    if (password.length >= 256) {
      throw new Error(JSON.stringify({ code: 10000, message: 'Wrong, < 256 Characters!' }));
    }
    await this.verifyPassword(oldPassword);
    await this.createPassword(password);
    return true;
  }

  async verifyPassword(password: string): Promise<void> {
    let shaPassword = password;
    if (!isValidSHA256(password)) {
      shaPassword = await sha256(password);
    }
    const encryptedBooted = store.getState().walletStore.booted;
    if (!encryptedBooted) {
      throw new Error(JSON.stringify({ code: 10001, message: 'Cannot unlock without a previous vault' }));
    }
    await passworder.decrypt(shaPassword, encryptedBooted);
    this.password = shaPassword;
    keysing.booted(this.password);
  }
  async unlock(password: string): Promise<void> {
    await this.verifyPassword(password);
    this.setUnlocked();
  }
  setUnlocked(): void {
    store.dispatch(setWalletCache({ ...store.getState().walletStore, isUnlocked: true }));
  }
  async setLocked(): Promise<void> {
    this.password = '';
    await store.dispatch(setWalletCache({ ...store.getState().walletStore, isUnlocked: false }));
    keysing.lock();
  }
  async hasWalletVault(): Promise<boolean> {
    const hasWallet = !!(this.getWalletList() && this.getWalletList().length > 0);
    await store.dispatch(setWalletCache({ ...store.getState().walletStore, hasWallet }));
    return hasWallet;
  }
  async ownerKey(address: string): Promise<string> {
    const key = await getEncryptionWallet(this.password, 0, address);
    return key;
  }

  generateMnemonic(): string {
    const result = ethers.Wallet.createRandom();
    if (result === null || result.mnemonic === null) {
      return '';
    }
    const mnemonic = result.mnemonic.phrase;
    return mnemonic;
  }
  async createWallet(mnemonic: string, pathIndex: number = 0, walletName?: string): Promise<WalletList> {
    const account: WalletAccount = {};
    for (const index in Object.keys(ADDRESS_PATH_TYPE)) {
      const key = Object.keys(ADDRESS_PATH_TYPE)[index];
      if (isValidSHA256(mnemonic)) {
        mnemonic = await getEncryptionWallet(this.password, 1, mnemonic);
      }
      const createFu = await createByMnemonic(mnemonic, key, pathIndex);
      const item = await createFu[key.toUpperCase()](createFu.mnemonic, createFu.path, createFu.pathIndex, key);
      account[key] = item;

      await setEncryptionWallet(this.password, 0, item.address, item.privateKey);
      delete account[key].privateKey;
    }
    account.accountName = `${NAMES['accountName']}${pathIndex + 1}`;
    account.id = pathIndex;
    account.heardImgName = getAccountLogo(account.id);
    const walletList = {
      mnemonic: await sha256(mnemonic),
      usePrivateKey: false,
      accountList: [account],
      id: 0,
      isBackup: false
    };
    await setEncryptionWallet(this.password, 1, walletList.mnemonic, mnemonic);
    return this.setWalletList(walletList, walletName);
  }
  async createPrivateWallet(privateKey: string, accountName?: string): Promise<WalletList> {
    const account: WalletAccount = {};
    if (!isValidEthPrivateKey(privateKey) && !isValidSolanaPrivateKey(privateKey)) {
      throw new Error(JSON.stringify({ code: 10002, message: 'Invalid private key' }));
    }
    const chain = whosePrivater(privateKey);
    let str = '';
    for (const index in Object.keys(ADDRESS_PATH_TYPE)) {
      const key = Object.keys(ADDRESS_PATH_TYPE)[index];
      const createFu = await createByPrivate();
      const item = await createFu[key.toUpperCase()](privateKey, key, chain);
      str += item.address;
      account[key] = item;
      await setEncryptionWallet(this.password, 0, item.address, item.privateKey);
      delete account[key].privateKey;
    }

    account.id = 0;
    account.accountName = accountName || undefined;
    account.heardImgName = getAccountLogo(account.id);
    account.key = str;
    const walletList = {
      mnemonic: '',
      usePrivateKey: true,
      accountList: [account],
      id: 0,
      isBackup: true
    };
    return await this.setWalletList(walletList);
  }

  async setWalletList(walletList: WalletList, walletName?: string): Promise<WalletList> {
    await this.verifyPassword(this.password);
    const pow = this.getWalletList() || [];
    const powList = deepCopy(pow);
    let backWallet: WalletList = walletList;
    if (walletList.mnemonic) {
      const powItem = powList.find(v => v.mnemonic === walletList.mnemonic);
      if (powItem) {
        const hasAccount = powItem.accountList.findIndex(v => v.id === walletList.accountList[0].id);
        if (hasAccount === -1) {
          powItem.accountList.push(...walletList.accountList);
          await store.dispatch(setWalletCache({ ...store.getState().walletStore, walletList: powList }));
        } else {
          return Object.assign(powItem, { isRepeat: true });
        }
      } else {
        const numIndex = powList.find(v => v.usePrivateKey) ? powList.length : powList.length + 1;
        walletList.walletName = walletName || `${NAMES['walletName']}${numberToCharCode(numIndex)}`;
        walletList.id = findAndIncrementMax(powList.map(v => v.id));
        powList.push(walletList);
        await store.dispatch(setWalletCache({ ...store.getState().walletStore, walletList: powList }));
      }
    } else if (walletList.usePrivateKey) {
      const powItem = powList.find(v => v.usePrivateKey === walletList.usePrivateKey);
      if (powItem) {
        const hasAccount = powItem.accountList.find(v => v.key === walletList.accountList[0].key);
        if (!hasAccount) {
          walletList.accountList[0].id = findAndIncrementMax(powItem.accountList.map(v => v.id));
          walletList.accountList[0].heardImgName = getAccountLogo(walletList.accountList[0].id);
          backWallet = walletList;
          backWallet.id = powItem.id;
          powItem.accountList.push(...walletList.accountList);
          await store.dispatch(setWalletCache({ ...store.getState().walletStore, walletList: powList }));
        } else {
          const currentWallet = await this.getWalletAndAccount(powItem.id, hasAccount.id);
          currentWallet.isRepeat = true;
          return currentWallet;
        }
      } else {
        walletList.walletName = NAMES['usePrividerName'];
        walletList.id = findAndIncrementMax(powList.map(v => v.id));
        backWallet = walletList;
        powList.push(walletList);
        await store.dispatch(setWalletCache({ ...store.getState().walletStore, walletList: powList }));
      }
    }

    !store.getState().walletStore.hasWallet && this.hasWalletVault();
    return backWallet;
  }
  getWalletList() {
    return store.getState().walletStore.walletList;
  }
  async getCurrentWallet(): Promise<{ walletItem: WalletList; accountItem: WalletAccount }> {
    const { currentWalletId, currentAccountId } = store.getState().walletStore;
    const walletItem = await this.getWalletById(currentWalletId);
    let accountItem = walletItem.accountList.find(v => v.id === currentAccountId);
    if (!accountItem) {
      accountItem = walletItem.accountList[0];
    }
    if (walletItem && accountItem) {
      return { walletItem, accountItem };
    }
    throw new Error(JSON.stringify({ code: 10003, message: 'Getting wallet error' }));
  }

  async getWalletById(id: number) {
    try {
      const walletItem = this.getWalletList().find(v => v.id === id);
      if (!walletItem) {
        return this.getDefaultWallet();
      }
      return walletItem;
    } catch (error) {
      throw new Error(JSON.stringify({ code: 10004, message: 'Wallet not found' }));
    }
  }
  async getDefaultWallet() {
    try {
      const defaultWallet = this.getWalletList()[0];
      if (defaultWallet) {
        return defaultWallet;
      }
      throw new Error(JSON.stringify({ code: 10004, message: 'Wallet not found' }));
    } catch (error) {
      throw new Error(JSON.stringify({ code: 10004, message: 'Wallet not found' }));
    }
  }
  async getWalletAndAccount(walletId: number, accountId: number) {
    const walletItem = await this.getWalletById(walletId);
    const accountItem = walletItem.accountList.find(v => v.id === accountId);
    if (!accountItem) {
      throw new Error(JSON.stringify({ code: 10005, message: 'Account not found' }));
    }
    const backWallet = deepCopy(walletItem);
    backWallet.accountList = [accountItem];
    return backWallet;
  }
  async getAccountById(walletId: number, accountId: number) {
    const walletItem = await this.getWalletById(walletId);
    const accountItem = walletItem.accountList.find(v => v.id === accountId);
    if (!accountItem) {
      throw new Error(JSON.stringify({ code: 10005, message: 'Account not found' }));
    }
    return accountItem;
  }
  async getNextWalletName() {
    const walletMap = this.getWalletList().filter(v => v.mnemonic !== '');
    if (walletMap.length) {
      return `${NAMES['walletName']}${numberToCharCode(walletMap.length + 1)}`;
    }
    return `${NAMES['walletName']}${numberToCharCode(1)}`;
  }

  async getNextPrivateAccountName() {
    const walletMap = this.getWalletList().find(v => v.usePrivateKey);
    if (walletMap) {
      const { accountList } = walletMap;
      return `${NAMES['accountName']}${accountList.length + 1}`;
    }
    return `${NAMES['accountName']}${1}`;
  }

  async isBackupWallet(walletId: number) {
    const walletItem = await this.getWalletById(walletId);
    return walletItem.isBackup;
  }
  async setBackupWallet(walletId: number) {
    const walletItem = await this.getWalletById(walletId);
    const item = deepCopy(walletItem);
    item.isBackup = true;
    this.updatedWallet(item);
    return true;
  }
  async setCurrentWallet(walletId: number = 0, accountId: number = 0) {
    await store.dispatch(
      setWalletCache({ ...store.getState().walletStore, currentWalletId: walletId, currentAccountId: accountId })
    );
    return this.getCurrentWallet();
  }

  async setWalletName(walletId: number, name: string) {
    const walletItem = await this.getWalletById(walletId);
    const item = deepCopy(walletItem);
    item.walletName = name;
    this.updatedWallet(item);
    return true;
  }

  async setAccountName(walletId: number, accountId: number, name: string) {
    const walletItem = await this.getWalletById(walletId);
    const accountItem = walletItem.accountList.find(v => v.id === accountId);
    if (accountItem) {
      const item = deepCopy(accountItem);
      item.accountName = name;
      this.updatedAccount(walletId, item);
      return true;
    }

    throw new Error('account not found');
  }
  async updatedWallet(wallet: WalletList) {
    const pow = this.getWalletList() || [];
    const walletList = deepCopy(pow);
    const walletItem = walletList.find(v => v.id === wallet.id);
    if (walletItem) {
      Object.assign(walletItem, wallet);
      await store.dispatch(setWalletCache({ ...store.getState().walletStore, walletList }));
      return;
    }
    throw new Error('wallet not found');
  }
  async updatedAccount(walletId: number, account: WalletAccount) {
    const pow = this.getWalletList() || [];
    const walletList = deepCopy(pow);
    const walletItem = walletList.find(v => v.id === walletId);
    if (walletItem) {
      const accountItem = walletItem.accountList.find(v => v.id === account.id);
      if (accountItem) {
        Object.assign(accountItem, account);
        await store.dispatch(setWalletCache({ ...store.getState().walletStore, walletList }));
        return;
      }
    }
    throw new Error('Account not found');
  }
  async sortArrayByWalletIds(ids: number[]) {
    const pow = this.getWalletList() || [];
    const walletList = deepCopy(pow);
    const idMap = {};
    walletList.forEach(person => {
      idMap[person.id] = person;
    });
    const sortedArray = ids.map(id => idMap[id]);
    await store.dispatch(setWalletCache({ ...store.getState().walletStore, walletList: sortedArray }));
    return sortedArray;
  }
  async sortArrayByAccountIds(walletId: number, accountIds: number[]) {
    const pow = this.getWalletList() || [];
    const walletList = deepCopy(pow);
    const walletItem = walletList.find(v => v.id === walletId);
    if (walletItem) {
      const idMap = {};
      walletItem.accountList.forEach(person => {
        idMap[person.id] = person;
      });
      const sortedArray = accountIds.map(id => idMap[id]);
      walletItem.accountList = sortedArray;
      await store.dispatch(setWalletCache({ ...store.getState().walletStore, walletList }));
      return walletItem.accountList;
    }
    throw new Error('wallet not found');
  }
  async deleteWallet(password: string, walletId: number) {
    try {
      await this.verifyPassword(password);
      const pow = this.getWalletList() || [];
      const walletList = deepCopy(pow);
      const index = walletList.findIndex(v => v.id === walletId);
      if (index !== -1) {
        walletList.splice(index, 1);
        await store.dispatch(setWalletCache({ ...store.getState().walletStore, walletList }));
        return true;
      }
      throw new Error('wallet not found');
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }
  async deleteWalletAccount(password: string, walletId: number, accountId: number) {
    try {
      await this.verifyPassword(password);
      const pow = this.getWalletList() || [];
      const walletList = deepCopy(pow);
      const walletItem = walletList.find(v => v.id === walletId);
      if (walletItem) {
        const index = walletItem.accountList.findIndex(v => v.id === accountId);
        if (index !== -1) {
          walletItem.accountList.splice(index, 1);
          if (walletItem.accountList.length === 0) {
            await this.deleteWallet(password, walletId);
            return true;
          }
          await store.dispatch(setWalletCache({ ...store.getState().walletStore, walletList }));
          return true;
        }
        throw new Error('account not found');
      }
      throw new Error('wallet not found');
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }
  async clearWalletList() {
    await store.dispatch(
      setWalletCache({ ...store.getState().walletStore, walletList: [], hasWallet: false, isBooted: false, booted: '' })
    );
    this.setCurrentWallet();
  }
  eventSecretCode(): void {
    keysing.on('EventSecretCode', value => {
      this.password = value;
      if (!value) {
        this.setLocked();
      }
    });
    keysing.getSecretCode();
  }
  async exportMnemonics(password: string, walletId: number): Promise<string> {
    await this.verifyPassword(password);
    const walletItem = await this.getWalletById(walletId);
    return await getEncryptionWallet(this.password, 1, walletItem.mnemonic);
  }
  async exportPrivateKey(password: string, walletId: number, accountId: number, chain: string): Promise<string> {
    await this.verifyPassword(password);
    const walletItem = await this.getWalletById(walletId);
    const accountItem = walletItem.accountList.find(v => v.id === accountId);
    if (accountItem) {
      return await this.ownerKey(accountItem[chain].address);
    }
    throw new Error(`Invalid private key`);
  }
  async isRepeatWalletName(name: string): Promise<boolean> {
    const walletList = this.getWalletList();
    if (walletList) {
      return !!walletList.some(v => v.walletName === name);
    }
    return false;
  }
  async isRepeatAccountName(walletId: number, name: string): Promise<boolean> {
    const walletItem = await this.getWalletById(walletId);
    if (walletItem) {
      return !!walletItem.accountList.some(v => v.accountName === name);
    }
    return false;
  }
}

export default new WalletController();
