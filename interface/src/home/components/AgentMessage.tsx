import clsx from 'clsx';
import { Box, CheckCircle, Loader, XCircle, Zap } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { shortenAddress } from '@/utils/address';
import { AgentEvent } from '../types/events';

const cleanObject = (params: object) =>
  Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== ''));

type AgentMessageProps = {
  event: AgentEvent;
};

export const AgentMessage: React.FC<AgentMessageProps> = ({ event }) => {
  const commandArgs = useMemo(() => {
    try {
      return cleanObject(event.command.args);
    } catch (e) {
      console.error(e);
      return {};
    }
  }, [event?.command?.args]);

  const hasContent = !event.error || (event.error && !!event.reason);

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [containerRef.current]);

  return (
    <div ref={containerRef} className="flex w-full gap-2">
      <img src="/assets/agent.png" className="w-8 h-8 rounded" />
      <div
        className={clsx(
          'flex flex-col bg-slate-100 w-fit max-w-[80%] py-3 px-4 rounded-xl rounded-tl-none',
          hasContent && 'pb-4',
          event.error && 'bg-red-100',
        )}
      >
        {event.error ? (
          <span className="flex items-center gap-1 text-xs text-red-700">
            <XCircle size={14} /> <span className="font-medium">Error</span>
          </span>
        ) : event?.command?.name === 'finish' ? (
          <span className="flex items-center gap-1 text-xs text-slate-700">
            <CheckCircle size={14} /> <span className="font-medium">Finish</span>
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-slate-700">
            <Zap size={14} /> <span className="font-medium">Thought</span>
          </span>
        )}

        {hasContent && (
          <div className="flex flex-col gap-2 mt-2">
            {event.error ? (
              <p className="text-sm leading-snug text-red-900">{event.reason}</p>
            ) : (
              <>
                <p className="text-sm leading-snug">{event.thoughts.reasoning}</p>
                {event?.command?.name !== 'finish' && (
                  <div className="p-2 rounded-md bg-slate-300">
                    <span className="flex items-center gap-1 text-xs leading-none text-slate-700">
                      <Box size={14} /> <span className="font-medium">{event.command.name}</span>
                    </span>
                    {Object.keys(commandArgs).length > 0 ? (
                      <div className="flex flex-col max-w-full mt-2 overflow-hidden rounded w-fit">
                        <table className="table-auto">
                          <tbody>
                            {Object.entries(commandArgs).map(([key, value]) => (
                              <tr key={key} className="flex text-xs break-all bg-slate-100 text-slate-800">
                                <th className="px-1 font-medium bg-slate-400/60">{key}</th>
                                <td className="px-1" style={{ lineBreak: 'anywhere' }}>
                                  {(() => {
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
                                    if (typeof value !== 'string') {
                                      return value;
                                    }
                                    if (value.length === 42 && value.startsWith('0x')) {
                                      return shortenAddress(value);
                                    }
                                    return value;
                                  })()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : null}
                    {!event.resolved ? (
                      <div className="flex flex-col px-1 py-1 pt-2 mt-2 bg-yellow-200 border border-yellow-500 rounded">
                        <span className="flex items-center gap-1 text-xs leading-none text-yellow-800">
                          <Loader size={12} className="animate-spin" />{' '}
                          <span className="font-medium">Loading</span>
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col px-2 py-2 mt-2 border rounded bg-emerald-200 border-emerald-500">
                        <span className="flex items-center gap-1 text-xs leading-none text-emerald-800">
                          <CheckCircle size={12} /> <span className="font-medium">Resolved</span>
                        </span>

                        <div className="h-[1px] w-full bg-emerald-300 my-[6px]" />

                        <span
                          className="inline-block text-xs font-medium leading-tight text-emerald-700"
                          style={{ lineBreak: 'anywhere' }}
                        >
                          {typeof event.resolved.text === 'string'
                            ? event.resolved.text
                            : JSON.stringify(event.resolved.text)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
