import { ChatOpenAI } from 'langchain/chat_models/openai';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { AutoGPT } from 'langchain/experimental/autogpt';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OutputParser } from './output-parser';
import { tools } from './tools';

const vectorStore = new MemoryVectorStore(new OpenAIEmbeddings());
const outputParser = new OutputParser();

export const run = async () => {
  const autogpt = AutoGPT.fromLLMAndTools(
    new ChatOpenAI({ temperature: 0, openAIApiKey: process.env.OPENAI_API_KEY }),
    tools,
    {
      memory: vectorStore.asRetriever(),
      outputParser: outputParser,
      aiName: 'CryptoGPT',
      aiRole: 'Assistant',
    },
  );

  const input = `Send zero value transaction to your wallet address with your wallet. Check wallet address is correct. And print that transaction's hash`;
  console.log(`Executing with input "${input}"...`);

  try {
    const result = await autogpt.run([input]);
    console.log(`Got output ${result}`);
  } catch (e) {
    console.log(e);
  }
};
run();
