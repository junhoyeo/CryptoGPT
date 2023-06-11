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
    },
    { basePath: 'http://127.0.0.1:5000' },
  );
  console.log({ wallet: wallet.address });

  const PLANNER_SYSTEM_PROMPT_MESSAGE_TEMPLATE = [
    `Let's first understand the problem and devise a plan to solve the problem.`,
    `Please output the plan starting with the header "Plan:"`,
    `and then followed by a numbered list of steps.`,
    `Please make the plan the minimum number of steps required`,
    `to answer the query or complete the task accurately and precisely.`,
    `Your steps should be general, and should not require a specific method to solve a step. If the task is a question,`,
    `the final step in the plan must be the following: "Given the above steps taken,`,
    `please respond to the original query."`,
    `At the end of your plan, say "<END_OF_PLAN>"`,
  ].join(' ');

  const getToolsOverview = () => {
    const formattedStrings = tools.map((tool) => `'${tool.name}': ${tool.description}`);
    const uniqueStrings = [...new Set(formattedStrings)];
    return uniqueStrings.join('\n');
  };

  const PLANNER_CHAT_PROMPT = /* #__PURE__ */ ChatPromptTemplate.fromPromptMessages([
    /* #__PURE__ */ SystemMessagePromptTemplate.fromTemplate(PLANNER_SYSTEM_PROMPT_MESSAGE_TEMPLATE),
    /* #__PURE__ */ HumanMessagePromptTemplate.fromTemplate(
      `Your wallet address is ${wallet.address}.\n{input}`,
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

  const input = `What's the txHash after sending zero value transaction to CryptoGPT's wallet address with CryptoGPT's wallet?`;
  console.log(`Executing with input "${input}"...`);

  try {
    const result = await agentExecutor.call({ input });
    console.log(`Got output ${result.output}`);
  } catch (e) {
    console.log(e);
  }
};
run();
