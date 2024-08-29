import { ChainItem } from '../../service';
import { chains } from '../network/config';

export const getChainsPath = () => {
  const apt = {};
  (chains() as Array<ChainItem>).map(v => {
    apt[v.chain] = v.defaultPath;
  });
  return apt;
};
export const ADDRESS_PATH_TYPE = getChainsPath();

export const NAMES = {
  accountName: 'Account ',
  walletName: 'Wallet ',
  usePrividerName: 'Private Key'
};

export const keysingMessage = {
  get: 'KEYSING_PASSWORD_GET',
  set: 'KEYSING_PASSWORD_SET',
  key: 'KEYSING_PASSWORD'
};

export const ENCRYPTION_NAME = {
  0: 'ADDRESS_',
  1: 'MNEMONIC_HASH_'
};
