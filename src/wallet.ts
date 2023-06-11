import { JsonRpcProvider, Wallet } from 'ethers';

export const provider = new JsonRpcProvider('https://public-en-baobab.klaytn.net');
export const wallet = new Wallet(process.env.WALLET_PRIVATE_KEY || '');
export const signer = wallet.connect(provider);
