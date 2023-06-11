import { JsonRpcProvider, Wallet } from 'ethers';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { OpenAI } from 'langchain/llms/openai';
import { InMemoryFileStore } from 'langchain/stores/file/in_memory';
import { DynamicStructuredTool, DynamicTool } from 'langchain/tools';
import { z } from 'zod';

require('dotenv').config();

const store = new InMemoryFileStore();

export const run = async () => {
  // const vectorStore = new MemoryVectorStore(new OpenAIEmbeddings());
  const model = new OpenAI({
    temperature: 0,
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  // random wallet
  const provider = new JsonRpcProvider('https://public-en-baobab.klaytn.net');
  // const wallet = Wallet.createRandom()
  const wallet = new Wallet(process.env.WALLET_PRIVATE_KEY || '');
  const signer = wallet.connect(provider);
  console.log(wallet.address);
  // console.log(wallet.privateKey)

  const tools = [
    new DynamicTool({
      name: 'eth.address',
      description: 'call this to get your wallet address',
      func: async () => wallet.address,
    }),
    new DynamicTool({
      name: 'eth.balance',
      description: 'call this to get wallet balance of any input address',
      func: async (address) => {
        try {
          const balance = await provider.getBalance(address);
          console.log({ balance });
          return balance.toString();
        } catch (e) {
          console.log(e);
          return '0';
        }
      },
    }),
    // send with params as schema
    new DynamicStructuredTool({
      name: 'eth.send',
      description:
        'call this to send transactions with your wallet. props are {to,value,nonce,gasLimit,gasPrice,data,chainId}. Leave values blank if you dont need them(ex> you dont usually add nonce). This tool returns transaction hash after executing your transaction.',
      schema: z.object({
        to: z.string(),
        value: z.string().or(z.number()),
        nonce: z.string().or(z.number()),
        gasLimit: z.string().or(z.number()),
        gasPrice: z.string().or(z.number()),
        data: z.string(),
        chainId: z.string().or(z.number()),
      }),
      func: async (params) => {
        const cleaned = Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== ''));
        const tx = await signer.sendTransaction(cleaned);
        return tx.hash;
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

  const input = `Send 0 eth to your wallet address using your wallet, and return the transaction hash(hint: you might want to get your address first using eth.address tool).`;

  console.log(`Executing with input "${input}"...`);

  try {
    const result = await executor.call({ input });

    console.log(`Got output ${result.output}`);

    // // send 0 eth transaction to yourself
    // const input2 = `Send 0 eth to yourself`;

    // console.log(`Executing with input "${input2}"...`);
    // const result2 = await executor.call({ input: input2,  });
  } catch (e) {
    console.log(e);
  }
};
run();
