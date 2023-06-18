import { BaseLanguageModel } from 'langchain/base_language';
import { LLMChain } from 'langchain/chains';
import { AutoGPTOutputParser } from 'langchain/experimental/autogpt';
import { BasePromptTemplate, PromptTemplate } from 'langchain/prompts';
import { OutputParserException } from 'langchain/schema/output_parser';
import { correctJson } from './jsonutils';

export const NAIVE_FIX_TEMPLATE = `Instructions:
--------------
{instructions}
--------------
Completion:
--------------
{completion}
--------------

Above, the Completion did not satisfy the constraints given in the Instructions.
Error:
--------------
{error}
--------------

Please try again. Please only respond with an answer that satisfies the constraints laid out in the Instructions:`;

export const NAIVE_FIX_PROMPT = /* #__PURE__ */ PromptTemplate.fromTemplate(NAIVE_FIX_TEMPLATE);

export function preprocessJsonInput(inputStr: string) {
  // Replace single backslashes with double backslashes,
  // while leaving already escaped ones intact
  const correctedStr = inputStr.replace(/(?<!\\)\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})/g, '\\\\');

  // AutoGPT's correct json port in TypeScript
  return correctJson(correctedStr) || '{}';
}

export class AutoGPTOutputFixingParser extends AutoGPTOutputParser {
  lc_namespace = ['langchain', 'output_parsers', 'fix'];

  parser: OutputParser;

  retryChain: LLMChain;

  static fromLLM(
    llm: BaseLanguageModel,
    parser: OutputParser,
    fields?: {
      prompt?: BasePromptTemplate;
    },
  ) {
    const prompt = fields?.prompt ?? NAIVE_FIX_PROMPT;
    const chain = new LLMChain({ llm, prompt });
    return new AutoGPTOutputFixingParser({ parser, retryChain: chain });
  }

  constructor({ parser, retryChain }: { parser: OutputParser; retryChain: LLMChain }) {
    super(...arguments);
    this.parser = parser;
    this.retryChain = retryChain;
  }

  async parse(completion: string) {
    try {
      return await this.parser.parse(completion);
    } catch (e) {
      // eslint-disable-next-line no-instanceof/no-instanceof
      if (e instanceof OutputParserException) {
        const result = await this.retryChain.call({
          instructions: this.parser.getFormatInstructions(),
          completion,
          error: e,
        });
        const newCompletion: string = result[this.retryChain.outputKey];
        return this.parser.parse(newCompletion);
      }
      throw e;
    }
  }

  getFormatInstructions() {
    return this.parser.getFormatInstructions();
  }
}

export class OutputParser extends AutoGPTOutputParser {
  async parse(text: string) {
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (error) {
      try {
        const preprocessedText = preprocessJsonInput(text);
        parsed = JSON.parse(preprocessedText);
      } catch (error) {
        return {
          name: 'ERROR',
          args: { error: `Could not parse invalid json: ${text}` },
        };
      }
    }
    try {
      return {
        name: parsed.command.name,
        args: parsed.command.args,
        parsed,
      };
    } catch (error) {
      return {
        name: 'ERROR',
        args: { error: `Incomplete command args: ${parsed}` },
      };
    }
  }
}
