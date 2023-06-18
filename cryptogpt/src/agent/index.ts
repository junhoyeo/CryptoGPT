import { ChatOpenAI } from 'langchain/chat_models/openai';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { NextApiResponse } from 'next';
import { Config } from '@/config';
import { createCryptoGPTTools } from '@/tools';
import { AutoGPT } from './cryptogpt';
import { AutoGPTOutputFixingParser, OutputParser } from './parser';

const defaultOutputParser = new OutputParser();

export const createCryptoGPTAgent = (config: Config, res?: NextApiResponse) => {
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: config.OPENAI_API_KEY,
  });
  const vectorStore = new MemoryVectorStore(embeddings);
  const model = new ChatOpenAI(
    { temperature: 0, openAIApiKey: config.OPENAI_API_KEY, maxTokens: -1 },
    { basePath: config.OPENAI_API_BASE_PATH },
  );

  const outputParser = AutoGPTOutputFixingParser.fromLLM(
    new ChatOpenAI({ temperature: 0 }),
    defaultOutputParser,
  );

  return AutoGPT.fromLLMAndTools(
    model,
    createCryptoGPTTools({
      config,
      model,
      embeddings,
    }),
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
