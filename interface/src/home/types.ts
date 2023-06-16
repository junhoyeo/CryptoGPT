export type AgentEvent = {
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
};

export type ParsedAgentEvent =
  | AgentEvent
  | {
      type: 'tool';
      error: true;
      message: string | undefined;
    }
  | {
      type: 'tool';
      error: false;
      observation: any;
    };
