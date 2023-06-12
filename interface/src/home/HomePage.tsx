import styled from '@emotion/styled';
import React, { useCallback, useState } from 'react';

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

const HomePage = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [events, setEvents] = useState<AgentEvent[]>([]);

  const onClickRun = useCallback(async () => {
    if (loading) {
      return;
    }
    setLoading(true);
    const response = await fetch('/api/run_agent');

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
