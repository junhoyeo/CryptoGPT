import { createCryptoGPTAgent } from './agent';
import { Config } from './config';

export const runAgent = async (config: Config) => {
  const cryptoGPT = createCryptoGPTAgent(config);
  const input = `Send zero value transaction to your wallet address with your wallet. Check wallet address is correct. And print that transaction's hash`;
  console.log(`Executing with input "${input}"...`);

  try {
    const result = await cryptoGPT.run([input]);
    console.log(`Got output ${result}`);
  } catch (e) {
    console.log(e);
  }
};
