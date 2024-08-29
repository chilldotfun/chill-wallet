export interface WalletItem {
	publicKey: string;
	privateKey: string;
	address: string;
	mnemonic: string;
	wallet: unknown;
	isChecked: boolean;
}
export interface PairInfo {
	token0: Token;
	token1: Token;
	pairAddress: string;
}
export interface Token {
	name: string;
	symbol: string;
	address: string;
	decimals: number;
	reserve: number;
	price: number;
}
export interface ConnectParames {
	routeName?: string;
	pairAddress?: string;
	tokenAddress?: string;
	chain?: string;
}

export interface PriceItem {
	price: number;
	newPrice: number;
	priceImpact: number;
}

export interface SwapItem {
	name: string;
	chain: Array<string>;
	icon: string;
	url: string;
	isShow: boolean;
	factoryAddress: {
		v1: string;
		v2: string;
		v3: string;
	};
	fee: number;
}

export interface AddressList {
	publicKey: string;
	address: string;
	mnemonic: string;
	wallet: unknown;
	isChecked: boolean;
}
export interface MuTypeList {
	typeId: number;
	typeLabel: string;
	type: string;
	phrase?: string;
	addressList: AddressList[];
}

export interface HDWallet {
	mnemonic: string;
	typeList: MuTypeList[];
	coordinate: Array<number>;
	hdChecked: boolean;
	single?: boolean;
}

export interface UserCheckedHDWallet {
	checkedHdWallets: HDWallet;
	checkedHDWalletType: MuTypeList;
	checkedAddress: AddressList;
}

export interface TradeParams {
	privateKeyWIF: string;
	fromAddress: string;
	toAddress: string;
	sendAmount: number;
	addInputs: AddInputs[];
	remainAmount: number;
	redeemType?: string;
}

export interface WitnessUtxo {
	value: number;
	script: Buffer;
}
export interface AddInputs {
	hash: string;
	index: number;
	sequence?: number;
	nonWitnessUtxo?: Buffer;
	witnessUtxo?: WitnessUtxo;
	tapInternalKey?: Buffer;
	witnessScript?: Buffer;
}

export interface UtxoItemStatus {
	confirmed: boolean;
	block_height: number;
	block_hash: string;
	block_time: number;
}
export interface UtxoItem {
	value: number;
	txid: string;
	vout: number;
	status: UtxoItemStatus;
	inscription?: object;
}

export interface FeeRate {
	fastestFee: number;
	halfHourFee: number;
	hourFee: number;
	economyFee: number;
	minimumFee: number;
}

export interface TxHexVins {
	txid: string;
	vout: number;
	witness: Array<string>;
	sequence: number;
	is_coinbase: boolean;
	prevout: TxHexOuts;
}
export interface TxHexOuts {
	scriptpubkey: string;
	scriptpubkey_asm: string;
	scriptpubkey_type: string;
	scriptpubkey_address: string;
	value: number;
}
export interface TxhexStatus {
	confirmed: boolean;
	block_height: number;
	block_hash: string;
	block_time: number;
}

export interface TxhexApi {
	txid: string;
	version: number;
	vin: TxHexVins[];
	vout: TxHexOuts[];
	size: number;
	weight: number;
	sigops: number;
	fee: number;
	stauts: TxhexStatus;
	txHex: string;
}
