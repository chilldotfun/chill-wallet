import { AddressType, RestoreWalletType } from './types';
import { svgRegistry } from '@/popup/components/Icon';

export interface gasType {
  gasTime?: string;
  sats?: string;
  icon?: keyof typeof svgRegistry;
  key?: string;
}
export interface ItemProps {
  address?: string;
  value?: string;
  img?: string;
}
[];
export interface CollapseItemProps {
  title?: string;
  isLoading?: boolean;
  accountList: ItemProps[];
}

export interface ContextData {
  mnemonics: string;
  hdPath: string;
  passphrase: string;
  addressType: AddressType;
  restoreWalletType: RestoreWalletType;
  isRestore: boolean;
  isCustom: boolean;
  customHdPath: string;
  addressTypeIndex: number;
  step1Completed?: boolean;
}

export interface UpdateContextDataParams {
  mnemonics?: string;
  hdPath?: string;
  passphrase?: string;
  addressType?: AddressType;
  restoreWalletType?: RestoreWalletType;
  isCustom?: boolean;
  customHdPath?: string;
  addressTypeIndex?: number;
}
export interface VerifyData {
  sub: number;
  value: string;
  isError: boolean;
  key: string;
}
export interface addressType {
  name?: string;
  address?: string;
  coinVal?: string;
  icon?: keyof typeof svgRegistry;
  time?: string;
}
