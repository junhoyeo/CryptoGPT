import {
  getEncodingNameForModel,
  Tiktoken,
  TiktokenBPE,
  TiktokenEncoding,
  TiktokenModel,
} from 'js-tiktoken/lite';
import { AsyncCaller } from './async_caller';

const cache: Record<string, Promise<TiktokenBPE>> = {};

const caller = /* #__PURE__ */ new AsyncCaller({});

export async function getEncoding(
  encoding: TiktokenEncoding,
  options?: {
    signal?: AbortSignal;
    extendedSpecialTokens?: Record<string, number>;
  },
) {
  if (!(encoding in cache)) {
    cache[encoding] = caller
      .fetch(`https://tiktoken.pages.dev/js/${encoding}.json`, {
        signal: options?.signal,
      })
      .then((res) => res.json())
      .catch((e) => {
        delete cache[encoding];
        throw e;
      });
  }

  return new Tiktoken(await cache[encoding], options?.extendedSpecialTokens);
}

export async function encodingForModel(
  model: TiktokenModel,
  options?: {
    signal?: AbortSignal;
    extendedSpecialTokens?: Record<string, number>;
  },
) {
  return getEncoding(getEncodingNameForModel(model), options);
}

// https://www.npmjs.com/package/js-tiktoken

export const getModelNameForTiktoken = (modelName: string): TiktokenModel => {
  if (modelName.startsWith('gpt-3.5-turbo-')) {
    return 'gpt-3.5-turbo';
  }

  if (modelName.startsWith('gpt-4-32k-')) {
    return 'gpt-4-32k';
  }

  if (modelName.startsWith('gpt-4-')) {
    return 'gpt-4';
  }

  return modelName as TiktokenModel;
};

export const getEmbeddingContextSize = (modelName?: string): number => {
  switch (modelName) {
    case 'text-embedding-ada-002':
      return 8191;
    default:
      return 2046;
  }
};

export const getModelContextSize = (modelName: string): number => {
  switch (getModelNameForTiktoken(modelName)) {
    case 'gpt-3.5-turbo':
      return 4096;
    case 'gpt-4-32k':
      return 32768;
    case 'gpt-4':
      return 8192;
    case 'text-davinci-003':
      return 4097;
    case 'text-curie-001':
      return 2048;
    case 'text-babbage-001':
      return 2048;
    case 'text-ada-001':
      return 2048;
    case 'code-davinci-002':
      return 8000;
    case 'code-cushman-001':
      return 2048;
    default:
      return 4097;
  }
};

interface CalculateMaxTokenProps {
  prompt: string;
  modelName: TiktokenModel;
}

export const calculateMaxTokens = async ({ prompt, modelName }: CalculateMaxTokenProps) => {
  // fallback to approximate calculation if tiktoken is not available
  let numTokens = Math.ceil(prompt.length / 4);

  try {
    numTokens = (await encodingForModel(modelName)).encode(prompt).length;
  } catch (error) {
    console.warn('Failed to calculate number of tokens, falling back to approximate count');
  }

  const maxTokens = getModelContextSize(modelName);
  return maxTokens - numTokens;
};
