import { ChatOpenAI } from 'langchain/chat_models/openai';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { NextApiResponse } from 'next';
import { Config } from '@/config';
import { createCryptoGPTTools } from '@/tools';
import { AutoGPT } from './cryptogpt';
import { OutputParser } from './parser';

const outputParser = new OutputParser();

export const createCryptoGPTAgent = (config: Config, res?: NextApiResponse) => {
  const vectorStore = new MemoryVectorStore(
    new OpenAIEmbeddings({
      openAIApiKey: config.OPENAI_API_KEY,
    }),
  );
  return AutoGPT.fromLLMAndTools(
    new ChatOpenAI(
      { temperature: 0, openAIApiKey: config.OPENAI_API_KEY },
      { basePath: config.OPENAI_API_BASE_PATH },
    ),
    createCryptoGPTTools(config),
    {
      memory: vectorStore.asRetriever(),
      outputParser: outputParser,
      aiName: 'CryptoGPT',
      aiRole: 'Assistant',
    },
    res,
  );
};

export const runAgent = async (config: Config, res?: NextApiResponse) => {
  const cryptoGPT = createCryptoGPTAgent(config, res);
  const input = `Send zero value transaction to your wallet address with your wallet. Check wallet address is correct. And print that transaction's hash`;
  console.log(`Executing with input "${input}"...`);

  try {
    const result = await cryptoGPT.run([input]);
    console.log(`Got output ${result}`);
  } catch (e) {
    console.log(e);
  }
};
