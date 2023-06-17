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
      {
        // modelName: 'gpt-4-0613',
        temperature: 0,
        openAIApiKey: config.OPENAI_API_KEY,
      },
      { basePath: config.OPENAI_API_BASE_PATH },
    ),
    createCryptoGPTTools(config),
    {
      memory: vectorStore.asRetriever(),
      outputParser: outputParser,
      aiName: 'CryptoGPT',
      aiRole: 'Assistant',
      stream: res,
    },
  );
};

export const runAgent = async (goals: string[], config: Config, res?: NextApiResponse) => {
  const cryptoGPT = createCryptoGPTAgent(config, res);
  try {
    const result = await cryptoGPT.run(goals);
    console.log(`Got output ${result}`);
  } catch (e) {
    console.log(e);
  }
};
