import path from 'path';
import dotenv from 'dotenv';
import { JsonRpcProvider, Wallet } from 'ethers';
import findWorkspaceRoot from 'find-yarn-workspace-root';

const WORKSPACE_ROOT_PATH = findWorkspaceRoot(null) ?? '';
dotenv.config({
  path: path.resolve(WORKSPACE_ROOT_PATH, '.env'),
});

export const provider = new JsonRpcProvider(process.env.JSON_RPC_URL);
export const wallet = new Wallet(process.env.WALLET_PRIVATE_KEY || '');
export const signer = wallet.connect(provider);
