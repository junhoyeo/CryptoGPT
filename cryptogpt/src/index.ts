import { LLMChain } from 'langchain';
// import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import {
  LLMPlanner,
  PlanAndExecuteAgentExecutor,
  PlanOutputParser,
} from 'langchain/experimental/plan_and_execute';
import { OpenAI } from 'langchain/llms/openai';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from 'langchain/prompts';
import { tools } from './tools';
import { wallet } from './wallet';

export const run = async () => {
  const llm = new OpenAI(
    {
      temperature: 0,
      openAIApiKey: process.env.OPENAI_API_KEY,
      verbose: true,
      maxConcurrency: 2,
      maxRetries: 20,
    },
    // { basePath: 'http://127.0.0.1:5000' },
  );
  // const llm = new HuggingFaceInference({
  //   model: 'gpt2-large',
  //   apiKey: process.env.HUGGINGFACEHUB_API_KEY,
  //   temperature: 0,
  // });
  console.log({ wallet: wallet.address });

  const PLANNER_SYSTEM_PROMPT_MESSAGE_TEMPLATE = [
    `Understand the task, create a concise plan labeled 'Plan:', listing steps to accomplish it. Ensure accuracy and generality of steps. If the task is a question, the last step should be answering it. Finish the plan with '<END_OF_PLAN>'`,
  ].join(' ');

  // const getToolsOverview = () => {
  //   const formattedStrings = tools.map((tool) => `'${tool.name}': ${tool.description}`);
  //   const uniqueStrings = [...new Set(formattedStrings)];
  //   return uniqueStrings.join('\n');
  // };

  const PLANNER_CHAT_PROMPT = /* #__PURE__ */ ChatPromptTemplate.fromPromptMessages([
    /* #__PURE__ */ SystemMessagePromptTemplate.fromTemplate(PLANNER_SYSTEM_PROMPT_MESSAGE_TEMPLATE),
    /* #__PURE__ */ HumanMessagePromptTemplate.fromTemplate(
      // `Your wallet address is ${wallet.address}.\n{input}`,
      `{input}`,
    ),
  ]);
  const plannerLlmChain = new LLMChain({
    llm,
    prompt: PLANNER_CHAT_PROMPT,
  });
  const planner = new LLMPlanner(plannerLlmChain, new PlanOutputParser());

  const agentExecutor = new PlanAndExecuteAgentExecutor({
    verbose: true,
    planner,
    stepExecutor: PlanAndExecuteAgentExecutor.getDefaultStepExecutor({
      llm,
      tools,
    }),
  });
  console.log('Loaded agent.');

  // const agentExecutor = await initializeAgentExecutorWithOptions(tools, llm, {
  //   agentType: 'structured-chat-zero-shot-react-description',
  //   verbose: true,
  //   callbacks: { handleToolEnd: console.log } as any,
  // });

  const input = `What's the txHash after sending zero value transaction to your wallet address with your wallet?`;
  console.log(`Executing with input "${input}"...`);

  try {
    const result = await agentExecutor.call({ input });
    console.log(`Got output ${result.output}`);
  } catch (e) {
    console.log(e);
  }
};
run();
