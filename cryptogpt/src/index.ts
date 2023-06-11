import { PlanAndExecuteAgentExecutor } from 'langchain/experimental/plan_and_execute';
import { OpenAI } from 'langchain/llms/openai';
import { tools } from './tools';
import { wallet } from './wallet';

require('dotenv').config();

export const run = async () => {
  const model = new OpenAI({
    temperature: 0,
    openAIApiKey: process.env.OPENAI_API_KEY,
    verbose: true,
  });
  console.log({ wallet: wallet.address });

  const executor = PlanAndExecuteAgentExecutor.fromLLMAndTools({
    llm: model,
    tools,
    verbose: true,
  });
  console.log('Loaded agent.');

  const input = `What's the txHash after sending zero value transaction to your wallet address with your wallet?`;
  console.log(`Executing with input "${input}"...`);

  try {
    const result = await executor.call({ input });
    console.log(`Got output ${result.output}`);
  } catch (e) {
    console.log(e);
  }
};
run();
