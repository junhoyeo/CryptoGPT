import { SerperParameters, Tool } from 'langchain/tools';

type SerperAPIResponse = {
  searchParameters: {
    q: string;
    gl: string;
    hl: string;
    num: number;
    autocorrect: boolean;
    page: number;
    type: 'search';
  };
  searchInformation?: {
    didYouMean: string;
  };
  answerBox?: {
    title: string;
    answer: string;
  };
  organic?: {
    title: string;
    link: string;
    snippet: string;
    position: number;
  }[];
};

type SerperAPISearchToolParameters = SerperParameters & {
  organicMaxLength?: number;
};

export class SerperAPISearchTool extends Tool {
  toJSON() {
    return this.toJSONNotImplemented();
  }

  protected key: string;

  protected params: Partial<SerperAPISearchToolParameters>;

  constructor(apiKey: string, params: Partial<SerperAPISearchToolParameters> = {}) {
    super();

    if (!apiKey) {
      throw new Error(
        'Serper API key not set. You can set it as SERPER_API_KEY in your .env file, or pass it to Serper.',
      );
    }

    this.key = apiKey;
    this.params = params;
  }

  name = 'search';

  /** @ignore */
  async _call(input: string) {
    const options = {
      method: 'POST',
      headers: {
        'X-API-KEY': this.key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: input,
        gl: this.params.gl,
        hl: this.params.hl,
      }),
    };

    const res = await fetch('https://google.serper.dev/search', options);

    if (!res.ok) {
      throw new Error(`Got ${res.status} error from serper: ${res.statusText}`);
    }

    const json: SerperAPIResponse = await res.json();

    let result: Record<string, object> = {};
    if (json.answerBox) {
      result.answerBox = json.answerBox;
    }
    if (json.organic && json.organic.length > 0) {
      result.res = json.organic.slice(0, this.params.organicMaxLength || 5);
    }
    if (result.answerBox || result.res) {
      return JSON.stringify(result);
    }

    return 'No good search result found';
  }

  description =
    'a search engine. useful for when you need to answer questions about current events. input should be a search query. you can use web browser tool to inspect the result more.';
}
