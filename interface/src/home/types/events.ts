export type ToolEvent =
  | {
      id: string;
      type: 'tool';
      error: true;
      text: string | undefined;
    }
  | {
      id: string;
      type: 'tool';
      error: false;
      text: string | any;
    };

export type AgentEvent = {
  id: string;
  type: 'agent';
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
  resolved?: ToolEvent;
} & ({ error: true; reason: string } | { error: false });

export type ThinkingEvent = {
  id: string;
  type: 'thinking';
};

export type ParsedAgentEvent = AgentEvent | ToolEvent | ThinkingEvent;
