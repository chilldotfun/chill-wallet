import { Keypair, PublicKey, Transaction } from '@solana/web3.js';

export default class CustomWallet {
  private keypair: Keypair;

  constructor(keypair: Keypair) {
    this.keypair = keypair;
  }

  get publicKey(): PublicKey {
    return this.keypair.publicKey;
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    transaction.partialSign(this.keypair);
    return transaction;
  }

  async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    transactions.forEach(transaction => transaction.partialSign(this.keypair));
    return transactions;
  }
}
