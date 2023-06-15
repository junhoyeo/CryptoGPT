import styled from '@emotion/styled';
import { Config } from '@junhoyeo/cryptogpt';
import { CheckCircle, Zap } from 'lucide-react';
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

const goals = [
  `Retrieve your wallet address.`,
  `Send zero value transaction to yourself.`,
  `Check transaction receipt.`,
];

const HomePage = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [config, setConfig] = useLocalStorage<Config>('@config', {
    OPENAI_API_KEY: publicRuntimeConfig.OPENAI_API_KEY,
    JSON_RPC_URL: publicRuntimeConfig.JSON_RPC_URL,
    WALLET_PRIVATE_KEY: publicRuntimeConfig.WALLET_PRIVATE_KEY,
  });

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
      body: JSON.stringify({ goals, config }),
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
  }, []);

  console.log(events);

  return (
    <div className="w-full bg-slate-50">
      <Container className="min-h-screen h-full container mx-auto max-w-xl bg-white pb-10">
        {goals.map((goal) => (
          <div key={goal}>{goal}</div>
        ))}

        <button disabled={loading} onClick={onClickRun}>
          Run Agent
        </button>

        <div className="flex flex-col gap-3">
          {events.map((event, index) => (
            <div
              key={index}
              className="flex flex-col bg-slate-100 w-fit max-w-[70%] py-3 px-4 rounded-xl rounded-tl-none"
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

              <div className="mt-2">
                <p className="leading-snug text-sm">{event.thoughts.reasoning}</p>
                {event?.command?.name !== 'finish' && (
                  <div style={{ backgroundColor: 'greenyellow' }}>
                    <span>{event.command.name}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
};

export default HomePage;

const Container = styled.div``;
