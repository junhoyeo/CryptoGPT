import styled from '@emotion/styled';
import { Config } from '@junhoyeo/cryptogpt';
import { Box, CheckCircle, Zap } from 'lucide-react';
import getNextConfig from 'next/config';
import React, { useCallback, useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

type AgentEvent = {
  thoughts: {
    text: string;
    reasoning: string;
    plan: string;
    criticism: string;
    speak: string;
  };
  command:
    | { name: 'evm_address' }
    | {
        name: 'evm_send';
        args: {
          to: string;
          value: string;
          nonce?: string;
          data?: string;
          gasLimit?: string;
          gasPrice?: string;
          chainId?: string;
        };
      }
    | { name: 'evm_getTransactionReceipt'; args: { input: string } }
    | { name: 'finish'; args: { response: string } };
};

const { publicRuntimeConfig } = getNextConfig();

const cleanObject = (params: object) =>
  Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== ''));

const FIRST_GOAL = `Retrieve your wallet address.`;

const HomePage = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [config, setConfig] = useLocalStorage<Config>('@config', {
    OPENAI_API_KEY: publicRuntimeConfig.OPENAI_API_KEY,
    JSON_RPC_URL: publicRuntimeConfig.JSON_RPC_URL,
    WALLET_PRIVATE_KEY: publicRuntimeConfig.WALLET_PRIVATE_KEY,
  });

  const [draft, setDraft] = useState<string>('');

  const onClickRun = useCallback(async () => {
    if (loading) {
      return;
    }
    setLoading(true);

    const response = await fetch('/api/run_agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ goals: [FIRST_GOAL, draft], config }),
    });

    if (!response.ok) {
      setLoading(false);
      throw Error(response.status.toString());
    }

    for (const reader = response.body?.getReader(); ; ) {
      if (!reader) {
        break;
      }

      let { value, done } = await reader.read();
      if (done) {
        break;
      }

      try {
        const decodedValue = new TextDecoder().decode(value);
        const event = JSON.parse(decodedValue);
        setEvents((events) => [...events, event]);

        if (event?.command?.name === 'finish') {
          break;
        }
      } catch (error) {
        console.error(error);
      }
    }

    setLoading(false);
  }, [draft]);

  console.log(events);

  return (
    <div className="w-full bg-slate-50">
      <Container className="min-h-screen h-full container mx-auto max-w-xl bg-white pt-5 pb-10">
        <div className="flex flex-col gap-3">
          {events.map((event, index) => (
            <div
              key={index}
              className="flex flex-col bg-slate-100 w-fit max-w-[70%] py-3 pb-4 px-4 rounded-xl rounded-tl-none"
            >
              {event?.command?.name === 'finish' ? (
                <span className="flex items-center gap-1 text-slate-700 text-xs">
                  <CheckCircle size={14} /> <span className="font-medium">Finish</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-slate-700 text-xs">
                  <Zap size={14} /> <span className="font-medium">Thought</span>
                </span>
              )}

              <div className="flex flex-col mt-2 gap-2">
                <p className="leading-snug text-sm">{event.thoughts.reasoning}</p>
                {event?.command?.name !== 'finish' && (
                  <div className="bg-slate-300 p-2 rounded-md">
                    <span className="flex items-center text-xs leading-none gap-1 text-slate-700">
                      <Box size={14} /> <span className="font-medium">{event.command.name}</span>
                    </span>
                    {'args' in event.command && Object.keys(event.command.args).length > 0 && (
                      <p className="text-xs break-all">{JSON.stringify(cleanObject(event.command.args))}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          <input
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />

          <button
            className="px-4 py-2 rounded-lg bg-slate-700 text-sm text-slate-200 disabled:bg-slate-400"
            disabled={loading}
            onClick={onClickRun}
          >
            Run Agent
          </button>
        </div>
      </Container>
    </div>
  );
};

export default HomePage;

const Container = styled.div``;
