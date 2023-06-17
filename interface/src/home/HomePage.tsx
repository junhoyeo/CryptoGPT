import styled from '@emotion/styled';
import { Config } from '@junhoyeo/cryptogpt';
import clsx from 'clsx';
import { Sparkles } from 'lucide-react';
import getNextConfig from 'next/config';
import React, { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Input } from '@/components/Input';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { AgentMessage } from './components/AgentMessage';
import { ThinkingMessage } from './components/ThinkingMessage';
import { ToolMessage } from './components/ToolMessage';
import { AgentEvent, ParsedAgentEvent } from './types/events';

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
    events.push({ id: uuidv4(), type: 'thinking' });

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

        setEvents((events) => {
          const newEvents = [...events.filter((ev) => ev.type !== 'thinking')];

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
            setEvents((events) => [
              ...events.filter((ev) => ev.type !== 'thinking'),
              { id: uuidv4(), type: 'thinking' },
            ]);
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
          {draft && loading && (
            <div className="flex w-full gap-2">
              <div className="flex flex-col w-fit ml-auto max-w-[80%] py-3 px-4 rounded-xl rounded-tr-none bg-slate-800 text-slate-50">
                <span className="flex items-center gap-1 text-xs text-slate-300">
                  <Sparkles size={14} /> <span className="font-medium">Goal</span>
                </span>

                <p className="text-sm">{draft}</p>
              </div>
            </div>
          )}
          {events.map((event) =>
            event.type === 'agent' ? (
              <AgentMessage key={event.id} event={event} />
            ) : event.type === 'tool' ? (
              // FIXME: Deprecated
              <ToolMessage key={event.id} event={event} />
            ) : event.type === 'thinking' ? (
              <ThinkingMessage key={event.id} />
            ) : null,
          )}

          <Input
            className={clsx(
              'flex w-full h-10 px-3 py-2',
              'transition-all border rounded-md bg-slate-100 border-input text-sm outline-none',
              'placeholder:text-muted-foreground focus:border-slate-300',
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
            value={draft}
            setValue={setDraft}
            disabled={loading}
          />

          <button
            className="px-4 py-3 text-sm rounded-lg bg-slate-800 text-slate-200 disabled:bg-slate-400 disabled:cursor-not-allowed"
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
