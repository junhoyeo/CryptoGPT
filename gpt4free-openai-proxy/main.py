from flask import Flask, request, Response, stream_with_context
import os
import sys
import json

app = Flask(__name__)
sys.path.append(os.path.join(os.path.dirname(
    __file__), os.path.pardir, 'gpt4free'))

from gpt4free import Provider  # noqa
import gpt4free  # noqa


@app.route('/')
def index():
    return 'Proxy Running...'


@app.route('/completions', methods=['GET', 'POST'])
def api():
    # Get the data from the POST request.
    data = request.get_json(force=True)
    print(data)
    prompt = data['prompt']
    res = {}

    try:
        result = gpt4free.Completion.create(Provider.You, prompt=prompt)
        print(result)
        res = {
            "id": "chatcmpl-abc123",
            "object": "chat.completion",
            "created": 1677858242,
            "model": data['model'],
            "usage": {
                "prompt_tokens": 0,
                "completion_tokens": 0,
                "total_tokens": 0
            },
            "choices": [
                {
                    "text": result,
                    "finish_reason": "stop",
                    "index": 0
                }
            ]
        }
    except Exception as e:
        return "Error: " + str(e)

    if (data['stream'] == True):
        def generator():
            yield json.dumps(res, ensure_ascii=False)
        resp = Response(stream_with_context(generator()),
                        status=200, content_type='application/json')
        return resp
    else:
        return json.dumps(res, ensure_ascii=False)


if __name__ == '__main__':
    app.run()
