import styled from '@emotion/styled';
import { Config } from '@junhoyeo/cryptogpt';
import { Loader, Wrench } from 'lucide-react';
import getNextConfig from 'next/config';
import React, { useCallback, useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { AgentMessage } from './AgentMessage';
import { AgentEvent, ParsedAgentEvent } from './types';

const { publicRuntimeConfig } = getNextConfig();

const FIRST_GOAL = `Retrieve your wallet address.`;
const LAST_GOAL = `Finish.`;

const HomePage = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [events, setEvents] = useState<ParsedAgentEvent[]>([]);
  const [config, setConfig] = useLocalStorage<Config>('@config', {
    OPENAI_API_KEY: publicRuntimeConfig.OPENAI_API_KEY,
    JSON_RPC_URL: publicRuntimeConfig.JSON_RPC_URL,
    WALLET_PRIVATE_KEY: publicRuntimeConfig.WALLET_PRIVATE_KEY,
  });

  const [draft, setDraft] = useState<string>('Send zero value transaction to yourself.');

  const onClickRun = useCallback(async () => {
    if (loading) {
      return;
    }
    setLoading(true);

    // add thinking
    events.push({ id: 'thinking', type: 'thinking' });

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

        const jsonls = decodedValue.split('\n');
        const decodedEvents = jsonls.flatMap((line) => {
          if (!line) {
            return [];
          }
          const event: ParsedAgentEvent = JSON.parse(line);
          return event;
        });

        if (decodedEvents.length > 0) {
          // remove thinking
          setEvents((events) => events.filter((event) => event.id !== 'thinking'));
        }
        setEvents((events) => {
          const newEvents = [...events];
          for (const event of decodedEvents) {
            if (event.type === 'tool') {
              const foundEvent = newEvents.find((e) => e.id === event.id && e.type === 'agent') as AgentEvent;
              if (foundEvent) {
                foundEvent.resolved = event;
              } else {
                newEvents.push(event);
              }
            } else {
              newEvents.push(event);
            }
          }
          return newEvents;
        });

        if (decodedEvents.some((event) => event.type === 'agent' && event?.command?.name === 'finish')) {
          break;
        } else {
          setTimeout(() => {
            // add thinking
            setEvents((events) => [...events, { id: 'thinking', type: 'thinking' }]);
          }, 200);
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
          {events.map((event) =>
            event.type === 'agent' ? (
              <AgentMessage key={event.id} event={event} />
            ) : event.type === 'tool' ? (
              <div
                key={event.id}
                className="flex flex-col bg-slate-100 w-fit max-w-[80%] py-3 pb-4 px-4 rounded-xl rounded-tl-none"
              >
                <span className="flex items-center gap-1 text-xs text-slate-700">
                  <Wrench size={14} /> <span className="font-medium">Tool</span>
                </span>

                <div className="flex flex-col gap-2 mt-2">{JSON.stringify(event)}</div>
              </div>
            ) : event.type === 'thinking' ? (
              <div key={event.id} className="flex w-full gap-2">
                <img src="/assets/agent.png" className="w-8 h-8 rounded" />
                <div className="flex flex-col bg-slate-100 w-fit max-w-[80%] py-3 px-4 rounded-xl rounded-tl-none">
                  <span className="flex items-center gap-1 text-xs text-slate-700">
                    <Loader size={14} className="animate-spin" />{' '}
                    <span className="font-medium">Thinking...</span>
                  </span>
                </div>
              </div>
            ) : null,
          )}

          <input
            className="flex w-full h-10 px-3 py-2 text-sm bg-transparent border rounded-md border-input placeholder:text-muted-foreground focus-visible:outline-none focus:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />

          <button
            className="px-4 py-3 text-sm rounded-lg bg-slate-700 text-slate-200 disabled:bg-slate-400"
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
