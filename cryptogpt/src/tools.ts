import { DynamicStructuredTool, DynamicTool, Tool } from 'langchain/tools';
import { z } from 'zod';
import { provider, signer, wallet } from './wallet';

export const tools = [
  new DynamicTool({
    name: 'print',
    description: 'Print value(string) to user',
    func: async (value: any) => {
      console.log(value);
      return value;
    },
  }),
  new DynamicTool({
    name: 'eth_address',
    description: 'Obtain my wallet address',
    func: async () => wallet.address,
  }),
  new DynamicTool({
    name: 'eth_balance',
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
    name: 'eth_send',
    description:
      'Sign and Broadcast transactions using my wallet. Returns txHash after successful execution. Properties are object of to(required),value(required),nonce,gasLimit,gasPrice,data,chainId. Optional properties, including gas SHOULD be blank if unknown or unnecessary.',
    schema: z.object({
      to: z.string(),
      value: z.any().optional(),
      nonce: z.any().optional(),
      gasLimit: z.any().optional(),
      gasPrice: z.any().optional(),
      data: z.string().optional(),
      chainId: z.any().optional(),
    }),
    func: async (params) => {
      const tx = Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== ''));
      const receipt = await signer.sendTransaction(tx);
      return receipt.hash;
    },
  }),
  new DynamicStructuredTool({
    name: 'eth_call',
    description: 'Query the blockchain.',
    schema: z.object({
      to: z.string(),
      data: z.string().optional(),
    }),
    func: async (params) => {
      const result = await provider.call(params);
      return result;
    },
  }),
  new DynamicTool({
    name: 'eth_getTransactionReceipt',
    description: 'Returns the receipt of a transaction by transaction hash.',
    func: async (txHash: any) => {
      const receipt = await provider.getTransactionReceipt(txHash);
      return receipt?.toJSON();
    },
  }),
] as Tool[];
