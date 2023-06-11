import { ChatOpenAI } from 'langchain/chat_models/openai';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { Config } from '@/config';
import { createCryptoGPTTools } from '@/tools';
import { AutoGPT } from './cryptogpt';
import { OutputParser } from './parser';

const vectorStore = new MemoryVectorStore(new OpenAIEmbeddings());
const outputParser = new OutputParser();

export const createCryptoGPTAgent = (config: Config) => {
  return AutoGPT.fromLLMAndTools(
    new ChatOpenAI(
      { temperature: 0, openAIApiKey: process.env.OPENAI_API_KEY },
      { basePath: process.env.OPENAI_API_BASE_PATH },
    ),
    createCryptoGPTTools(config),
    {
      memory: vectorStore.asRetriever(),
      outputParser: outputParser,
      aiName: 'CryptoGPT',
      aiRole: 'Assistant',
    },
  );
};
