import { createCryptoGPTAgent } from './agent';
import { Config } from './config';
import { NextApiResponse } from 'next';

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
