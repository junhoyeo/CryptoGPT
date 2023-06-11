import path from 'path';
import dotenv from 'dotenv';
import { JsonRpcProvider, Wallet } from 'ethers';
import findWorkspaceRoot from 'find-yarn-workspace-root';

const WORKSPACE_ROOT_PATH = findWorkspaceRoot(null) ?? '';
dotenv.config({
  path: path.resolve(WORKSPACE_ROOT_PATH, 'cryptogpt/.env'),
});

export const provider = new JsonRpcProvider('https://public-en-baobab.klaytn.net');
export const wallet = new Wallet(process.env.WALLET_PRIVATE_KEY || '');
export const signer = wallet.connect(provider);
