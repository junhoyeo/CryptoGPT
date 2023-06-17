import styled from '@emotion/styled';
import { Config } from '@junhoyeo/cryptogpt';
import clsx from 'clsx';
import { Send } from 'lucide-react';
import getNextConfig from 'next/config';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Input } from '@/components/Input';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { shortenAddress } from '@/utils/address';
import { AgentMessage } from './components/AgentMessage';
import { GoalMessage } from './components/GoalMessage';
import { ThinkingMessage } from './components/ThinkingMessage';
import { ToolMessage } from './components/ToolMessage';
import { AgentEvent, CryptoGPTEvent, ParsedAgentEvent } from './types/events';

const { publicRuntimeConfig } = getNextConfig();

const FIRST_GOAL = `Retrieve your wallet address.`;
const LAST_GOAL = `Finish.`;

const HomePage = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [events, setEvents] = useState<CryptoGPTEvent[]>([]);
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

    // show goal
    events.push({ id: uuidv4(), type: 'goal_set', goal: draft });

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

  const containerRef = useRef<HTMLDivElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!bottomBarRef.current) return;
    const resizeObserver = new ResizeObserver(() => {
      // print height of the bottom bar
      console.log(bottomBarRef.current?.clientHeight);
      if (containerRef.current) {
        containerRef.current.style.paddingBottom = `${bottomBarRef.current?.clientHeight}px`;

        // scroll to bottom with animation
        setTimeout(() => {
          window.scrollTo({
            top: containerRef.current?.offsetHeight || 0,
            behavior: 'smooth',
          });
        });
      }
    });
    resizeObserver.observe(bottomBarRef.current);
    return () => resizeObserver.disconnect(); // clean up
  }, []);

  return (
    <div className="w-full bg-slate-50">
      <Container
        ref={containerRef}
        className="container h-full max-w-2xl min-h-screen pt-8 pb-10 mx-auto bg-white"
      >
        <div className="flex flex-col gap-3">
          {events.length === 0 && (
            <div className="flex flex-col items-center w-full gap-3 my-6">
              <img src="/assets/cryptogpt-logo.svg" className="w-72" />
              <p className="inline-block max-w-[400px] leading-relaxed text-lg text-center text-slate-900">
                An experiment by{' '}
                <a href="https://github.com/junhoyeo" target="_blank">
                  <Badge className="hover:bg-slate-200">🏴‍☠️ @junhoyeo</Badge>
                </a>{' '}
                <br /> for <Badge>🤖 LLMs</Badge> achieving <Badge>🏦 Financial Autonomy</Badge>
              </p>
              <ul className="flex w-full gap-2 mt-4">
                <Box>Send zero value transaction to yourself.</Box>
                <Box>
                  Wrap{' '}
                  <span className="inline-block">
                    <TokenLogo src="/assets/eth.png" /> 1 ETH
                  </span>{' '}
                  with{' '}
                  <span className="inline-block">
                    <TokenLogo src="/assets/weth.png" /> WETH
                  </span>{' '}
                  deployed in <code>{shortenAddress('0x043c471bEe060e00A56CcD02c0Ca286808a5A436')}</code>. ABI
                  is <code>{`{"inputs":[], "name":"deposit", "outputs":[], ...}`}</code>.
                </Box>
                <Box>
                  Swap{' '}
                  <span className="inline-block">
                    <TokenLogo src="/assets/eth.png" /> 0.1 ETH
                  </span>{' '}
                  to{' '}
                  <span className="inline-block">
                    <TokenLogo src="/assets/matic.png" className="rounded-full" /> MATIC
                  </span>{' '}
                  with{' '}
                  <span className="inline-block">
                    <TokenLogo src="/assets/uni.png" className="bg-white rounded-full" /> UniswapRouterV2
                  </span>{' '}
                  deployed in <code>{shortenAddress('0xAbc12345Def67890FEdcBa09876E543210FeDcBa')}</code>.
                  {/* FIXME: Change fake address lol */}
                </Box>
              </ul>
            </div>
          )}
          {events.map((event) =>
            event.type === 'goal_set' ? (
              <GoalMessage key={event.id} event={event} />
            ) : event.type === 'agent' ? (
              <AgentMessage key={event.id} event={event} />
            ) : event.type === 'tool' ? (
              // FIXME: Deprecated
              <ToolMessage key={event.id} event={event} />
            ) : event.type === 'thinking' ? (
              <ThinkingMessage key={event.id} />
            ) : null,
          )}
        </div>
      </Container>

      <div ref={bottomBarRef} className="fixed bottom-0 left-0 right-0 w-full">
        <GradientContainer className="flex flex-col max-w-2xl gap-2 px-4 pt-8 pb-6 mx-auto">
          <Input
            className={clsx(
              'flex w-full h-10 px-3 py-3',
              'transition-all border rounded-md bg-slate-100 border-input text-sm outline-none',
              'placeholder:text-muted-foreground focus:border-slate-300',
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
            value={draft}
            setValue={setDraft}
            disabled={loading}
          />

          <button
            className={clsx(
              'flex items-center justify-center gap-2',
              'w-full px-4 py-4 text-sm rounded-lg bg-slate-800 text-slate-200',
              'hover:bg-slate-900 hover:text-slate-100 transition-all',
              'disabled:bg-slate-400 disabled:cursor-not-allowed',
            )}
            disabled={loading}
            onClick={onClickRun}
          >
            <Send size={14} /> Run Agent
          </button>
        </GradientContainer>
      </div>
    </div>
  );
};

export default HomePage;

const Container = styled.div``;
const GradientContainer = styled(Container)`
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0), #ffffff 40%);
  pointer-events: none;

  & > * {
    pointer-events: auto;
  }
`;

const Badge: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({ className, ...props }) => (
  <_Badge
    className={clsx(
      'mx-0.5 leading-none inline-block p-1 font-medium text-base rounded bg-slate-100 text-slate-800',
      className,
    )}
    {...props}
  />
);
const _Badge = styled.span``;

const Box: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({ className, ...props }) => (
  <_Box
    className={clsx(
      'flex-1 p-3 transition-colors rounded-lg cursor-pointer bg-slate-200 text-slate-500 hover:bg-slate-300',
      className,
    )}
    {...props}
  />
);
const _Box = styled.li`
  code {
    font-size: 14px;
    background-color: #f7fafc;
    border-radius: 4px;
  }
`;

type TokenLogoProps = React.HTMLAttributes<HTMLImageElement> & {
  src: string;
};
const TokenLogo: React.FC<TokenLogoProps> = ({ src, className, style, ...props }) => (
  <img
    className={clsx('inline-block', className)}
    src={src}
    style={{
      width: 16,
      height: 16,
      marginLeft: 3,
      filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.33))',
      objectFit: 'contain',
      ...style,
    }}
    {...props}
  />
);
