import { JsonRpcProvider, Wallet } from 'ethers';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { OpenAI } from 'langchain/llms/openai';
import { InMemoryFileStore } from 'langchain/stores/file/in_memory';
import { DynamicStructuredTool, DynamicTool } from 'langchain/tools';
import { z } from 'zod';

require('dotenv').config();

const store = new InMemoryFileStore();

export const run = async () => {
  const model = new OpenAI({
    temperature: 0,
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  const provider = new JsonRpcProvider('https://public-en-baobab.klaytn.net');
  const wallet = new Wallet(process.env.WALLET_PRIVATE_KEY || '');
  const signer = wallet.connect(provider);

  const tools = [
    new DynamicTool({
      name: 'address',
      description: 'Obtain your wallet address',
      func: async () => wallet.address,
    }),
    new DynamicTool({
      name: 'balance',
      description: 'Obtain raw balance of any given Ethereum address',
      func: async (_addr: any) => {
        try {
          let address: string = typeof _addr === 'string' ? _addr : _addr.address;
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
        'Send transactions from your wallet and returns txHash after successful execution. Properties: {to,value,nonce,gasLimit,gasPrice,data,chainId}(Omit any if unknown)',
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
  ];

  const executor = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: 'structured-chat-zero-shot-react-description',
    verbose: true,
    returnIntermediateSteps: true,
    // memory: new BufferMemory({
    //   memoryKey: "chat_history",
    //   returnMessages: true,
    // }),
    agentArgs: {
      // inputVariables: ["input", "agent_scratchpad", "chat_history"],
      inputVariables: ['input', 'agent_scratchpad'],
      // memoryPrompts: [new MessagesPlaceholder("chat_history")],
    },
    // memory: vectorStore.asRetriever(),
  });

  console.log('Loaded agent.');

  const input = `Send 0 eth to your wallet address using your wallet, and return the transaction hash.`;

  console.log(`Executing with input "${input}"...`);

  try {
    const result = await executor.call({ input });

    console.log(`Got output ${result.output}`);
  } catch (e) {
    console.log(e);
  }
};
run();
