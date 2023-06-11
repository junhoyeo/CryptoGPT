import { DynamicStructuredTool, DynamicTool, Tool } from 'langchain/tools';
import { z } from 'zod';
import { provider, signer, wallet } from './wallet';

export const tools = [
  new DynamicTool({
    name: 'address',
    description: 'Obtain your wallet address',
    func: async () => wallet.address,
  }),
  new DynamicTool({
    name: 'balance',
    description: 'Obtain raw balance of any given Ethereum address',
    func: async (address: any) => {
      try {
        const balance = await provider.getBalance(address);
        return balance.toString();
      } catch (e) {
        console.log(e);
        return '0';
      }
    },
  }),
  new DynamicStructuredTool({
    name: 'send',
    description:
      'Send transactions from your wallet and returns txHash after successful execution. Omit any properties if unknown',
    schema: z.object({
      to: z.string(),
      value: z.string().or(z.number()).optional(),
      nonce: z.string().or(z.number()).optional(),
      gasLimit: z.string().or(z.number()).optional(),
      gasPrice: z.string().or(z.number()).optional(),
      data: z.string().optional(),
      chainId: z.string().or(z.number()).optional(),
    }),
    func: async (params) => {
      const tx = Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== ''));
      const receipt = await signer.sendTransaction(tx);
      return receipt.hash;
    },
  }),
] as Tool[];
