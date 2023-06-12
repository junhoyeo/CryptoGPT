import styled from '@emotion/styled';
import { Config } from '@junhoyeo/cryptogpt';
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
  command: {
    name: string;
    args: any;
  };
};

const { publicRuntimeConfig } = getNextConfig();

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
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      setLoading(false);
      throw Error(response.status.toString());
    }

    for (const reader = response.body?.getReader(); ; ) {
      if (!reader) {
        break;
      }
      const { value, done } = await reader.read();

      if (done) {
        break;
      }

      try {
        const decodedValue = new TextDecoder().decode(value);
        const event = JSON.parse(decodedValue);
        setEvents((events) => [...events, event]);
      } catch (error) {
        console.error(error);
      }
    }

    setLoading(false);
  }, []);

  console.log(events);

  return (
    <Container>
      <button disabled={loading} onClick={onClickRun}>
        Run Agent
      </button>

      {events.map((event, index) => (
        <div key={index}>
          {event.thoughts.speak}
          <div style={{ backgroundColor: 'greenyellow' }}>{JSON.stringify(event.command)}</div>
        </div>
      ))}
    </Container>
  );
};

export default HomePage;

const Container = styled.div``;
