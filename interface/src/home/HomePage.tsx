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
    | { name: 'evm_address'; args: {} }
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

const shortenAddress = (address: string, size: number = 4) => {
  return `${address.substring(0, 2 + size)}...${address.substring(address.length - size)}`;
};

const FIRST_GOAL = `Retrieve your wallet address.`;
const LAST_GOAL = `Finish.`;

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
      body: JSON.stringify({ goals: [FIRST_GOAL, draft, LAST_GOAL], config }),
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
      <Container className="container h-full max-w-xl min-h-screen pt-5 pb-10 mx-auto bg-white">
        <div className="flex flex-col gap-3">
          {events.map((event, index) => (
            <div
              key={index}
              className="flex flex-col bg-slate-100 w-fit max-w-[80%] py-3 pb-4 px-4 rounded-xl rounded-tl-none"
            >
              {event?.command?.name === 'finish' ? (
                <span className="flex items-center gap-1 text-xs text-slate-700">
                  <CheckCircle size={14} /> <span className="font-medium">Finish</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-slate-700">
                  <Zap size={14} /> <span className="font-medium">Thought</span>
                </span>
              )}

              <div className="flex flex-col gap-2 mt-2">
                <p className="text-sm leading-snug">{event.thoughts.reasoning}</p>
                {event?.command?.name !== 'finish' && (
                  <div className="p-2 rounded-md bg-slate-300">
                    <span className="flex items-center gap-1 text-xs leading-none text-slate-700">
                      <Box size={14} /> <span className="font-medium">{event.command.name}</span>
                    </span>
                    {'args' in event.command && Object.keys(cleanObject(event.command.args)).length > 0 ? (
                      <div className="flex flex-col max-w-full mt-2 overflow-hidden rounded w-fit">
                        <table className="table-auto">
                          {Object.entries(cleanObject(event.command.args)).map(([key, value]) => (
                            <tr key={key} className="flex text-xs break-all bg-slate-100 text-slate-800">
                              <th className="px-1 font-medium bg-slate-400/60">{key}</th>
                              <td className="px-1 break-words" style={{ lineBreak: 'anywhere' }}>
                                {(() => {
                                  if (typeof value !== 'string') {
                                    return value;
                                  }
                                  if (value.length === 42 && value.startsWith('0x')) {
                                    return shortenAddress(value);
                                  }
                                  if (key === 'value') {
                                    return (
                                      <span className="flex items-center">
                                        <img
                                          src="/assets/eth.png"
                                          style={{
                                            width: 16,
                                            height: 16,
                                            filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.33))',
                                          }}
                                        />
                                        <span className="ml-1 font-semibold">
                                          {(Number(value) / 10 ** 18).toLocaleString()}
                                        </span>
                                        &nbsp;ETH
                                      </span>
                                    );
                                  }
                                  return value;
                                })()}
                              </td>
                            </tr>
                          ))}
                        </table>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          ))}

          <input
            className="flex w-full h-10 px-3 py-2 text-sm bg-transparent border rounded-md border-input placeholder:text-muted-foreground focus-visible:outline-none focus:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />

          <button
            className="px-4 py-2 text-sm rounded-lg bg-slate-700 text-slate-200 disabled:bg-slate-400"
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
