import { runAgent } from '@junhoyeo/cryptogpt';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    // const { accessToken } = await getAccessToken(req, res);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Content-Encoding', 'none');

    // FIXME:
    const config = {
      OPENAI_API_KEY: '',
      WALLET_PRIVATE_KEY: '',
      HUGGINGFACEHUB_API_KEY: '',
      OPENAI_API_BASE_PATH: '',
      JSON_RPC_URL: 'https://public-en-baobab.klaytn.net',
    };

    runAgent(config, res);

    res.on('close', () => {
      res.end();
    });
  }
};

export default handler;
