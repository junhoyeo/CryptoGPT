import { Interface, JsonRpcProvider, Wallet } from 'ethers';
import { BaseLanguageModel } from 'langchain/base_language';
import { Embeddings } from 'langchain/embeddings/base';
import { DynamicStructuredTool, DynamicTool, Serper, Tool } from 'langchain/tools';
import { WebBrowser } from 'langchain/tools/webbrowser';
import { z } from 'zod';
import { Config } from './config';

type CreateCryptoGPTToolsProps = {
  config: Config;
  model: BaseLanguageModel;
  embeddings: Embeddings;
};
export const createCryptoGPTTools = ({ config, model, embeddings }: CreateCryptoGPTToolsProps) => {
  const provider = new JsonRpcProvider(config.JSON_RPC_URL);
  const wallet = new Wallet(config.WALLET_PRIVATE_KEY || '');
  const signer = wallet.connect(provider);

  return [
    new Serper(config.SERPER_API_KEY, {
      gl: 'us',
      hl: 'en',
    }),
    new WebBrowser({ model, embeddings }),
    new DynamicTool({
      name: 'print',
      description: 'Print value(string) to user',
      func: async (value: any) => {
        console.log(value);
        return value;
      },
    }),
    new DynamicTool({
      name: 'evm_address',
      description: 'Obtain my wallet address',
      func: async () => wallet.address,
    }),
    new DynamicTool({
      name: 'evm_balance',
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
      name: 'evm_send',
      // description:
      //   'Sign and Broadcast transactions using my wallet. Returns txHash after successful execution. Properties are object of to(required),value(required),nonce,gasLimit,gasPrice,data,chainId. Optional properties, including gas SHOULD be blank if unknown or unnecessary.',
      description:
        'Sign and Broadcast transactions using my wallet. Returns txHash after successful execution. Properties are object of to(required),value(required),nonce,gasLimit,gasPrice,data. Optional properties, including gas SHOULD be blank if unknown or unnecessary.',
      schema: z.object({
        to: z.string(),
        value: z.any().optional(),
        nonce: z.any().optional(),
        gasLimit: z.any().optional(),
        gasPrice: z.any().optional(),
        data: z.string().optional(),
        // chainId: z.any().optional(),
      }),
      func: async (params) => {
        const tx = Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== ''));
        const receipt = await signer.sendTransaction(tx);
        return receipt.hash;
      },
    }),
    new DynamicStructuredTool({
      name: 'evm_call',
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
      name: 'evm_getTransactionReceipt',
      description: 'Returns the receipt of a transaction by transaction hash.',
      func: async (txHash: any) => {
        const receipt = await provider.getTransactionReceipt(txHash);
        return receipt?.toJSON();
      },
    }),
    new DynamicTool({
      name: 'evm_encodeFunctionData',
      description: 'Receives {abi:ABI[],params:any[]} and returns the encoded data of a function call',
      func: async (params: any) => {
        const abi = Array.isArray(params.abi) ? params.abi : [params.abi];
        const iface = new Interface(abi);
        const data = iface.encodeFunctionData(params.params);
        return data;
      },
    }),
  ] as Tool[];
};
