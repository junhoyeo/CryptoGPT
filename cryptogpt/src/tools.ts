import { DynamicStructuredTool, DynamicTool, Tool } from 'langchain/tools';
import { z } from 'zod';
import { provider, signer, wallet } from './wallet';

export const tools = [
  new DynamicTool({
    name: 'eth_address',
    description: "Obtain CryptoGPT's wallet address",
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
      "Sign and Broadcast transactions using CryptoGPT's wallet. Returns txHash after successful execution. Properties are object of to,value,nonce,gasLimit,gasPrice,data,chainId(Omit any properties if unknown/unnecessary)",
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
] as Tool[];
