import { AutoGPTOutputParser } from 'langchain/experimental/autogpt';
import { correctJson } from './jsonutils';

export function preprocessJsonInput(inputStr: string) {
  // Replace single backslashes with double backslashes,
  // while leaving already escaped ones intact
  const correctedStr = inputStr.replace(/(?<!\\)\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})/g, '\\\\');

  // AutoGPT's correct json port in TypeScript
  return correctJson(correctedStr) || '{}';
}

export class OutputParser extends AutoGPTOutputParser {
  async parse(text: string) {
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (error) {
      const preprocessedText = preprocessJsonInput(text);
      try {
        parsed = JSON.parse(preprocessedText);
      } catch (error) {
        return {
          name: 'ERROR',
          args: { error: `Could not parse invalid json: ${text}` },
        };
      }
    }
    try {
      return {
        name: parsed.command.name,
        args: parsed.command.args,
      };
    } catch (error) {
      return {
        name: 'ERROR',
        args: { error: `Incomplete command args: ${parsed}` },
      };
    }
  }
}
