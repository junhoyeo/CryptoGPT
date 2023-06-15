import { Box, CheckCircle, Zap } from 'lucide-react';
import React, { useMemo } from 'react';
import { AgentEvent } from './types';

const cleanObject = (params: object) =>
  Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== ''));

const shortenAddress = (address: string, size: number = 4) => {
  return `${address.substring(0, 2 + size)}...${address.substring(address.length - size)}`;
};

type AgentMessageProps = {
  event: AgentEvent;
};

export const AgentMessage: React.FC<AgentMessageProps> = ({ event }) => {
  const commandArgs = useMemo(() => cleanObject(event.command.args), [event.command.args]);

  return (
    <div className="flex flex-col bg-slate-100 w-fit max-w-[80%] py-3 pb-4 px-4 rounded-xl rounded-tl-none">
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
            {Object.keys(commandArgs).length > 0 ? (
              <div className="flex flex-col max-w-full mt-2 overflow-hidden rounded w-fit">
                <table className="table-auto">
                  <tbody>
                    {Object.entries(commandArgs).map(([key, value]) => (
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
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
