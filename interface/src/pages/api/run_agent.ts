import { runAgent } from '@junhoyeo/cryptogpt';
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const configSchema = z
  .object({
    OPENAI_API_KEY: z.string(),
    WALLET_PRIVATE_KEY: z.string(), // FIXME: This should only by processed in-browser
    OPENAI_API_BASE_PATH: z.string().or(z.undefined()),
    JSON_RPC_URL: z.string(),
  })
  .required();
const requestBodySchema = z
  .object({
    goals: z.array(z.string()),
    config: configSchema,
  })
  .required();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Content-Encoding', 'none');

  const { goals, config } = requestBodySchema.parse(req.body);
  await runAgent(goals, config, res);

  res.on('close', () => {
    res.end();
  });
};

export default handler;
