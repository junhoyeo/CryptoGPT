<img src=".github/logo.png" width="400" />

<h1>
  ✸ CryptoGPT — <br />
  An experiment for <code>🤖 LLMs</code> <br />
  archiving <code>🏦 Financial Autonomy</code>
</h1>

- ✸ 🏦 **Allowing _Financial Autonomy_ to _[Sam's Children](https://en.wikipedia.org/wiki/ChatGPT)_**
- ✸ 🪪 Enabling Language Learning Models (LLMs) to **establish their own unique identities** within the blockchain.
- ✸ 🇦🇶 **Make the name _CryptoGPT_ great again.** Not affiliated with [LayerAI](https://layerai.org/) or any other (scammy) web3 projects.

## Demo

```
Executing with input "Send zero value transaction to your wallet address with your wallet. Check wallet address is correct. And print that transaction's hash"...
{
    "thoughts": {
        "text": "I will use the 'evm_address' command to obtain my wallet address.",
        "reasoning": "I need to obtain my wallet address to send a zero value transaction to it.",
        "plan": "- Use 'evm_address' command to obtain my wallet address\n- Verify that the address is correct\n- Use 'evm_send' command to send a zero value transaction to my wallet address\n- Print the transaction hash",
        "criticism": "I need to make sure that I verify the wallet address before sending the transaction.",
        "speak": "I will use the 'evm_address' command to obtain my wallet address."
    },
    "command": {
        "name": "evm_address",
        "args": {}
    }
}
{
    "thoughts": {
        "text": "I will use the 'evm_send' command to send a zero value transaction to my wallet address.",
        "reasoning": "I need to send a zero value transaction to my wallet address to verify that the address is correct.",
        "plan": "- Use 'evm_send' command to send a zero value transaction to my wallet address\n- Print the transaction hash",
        "criticism": "I need to make sure that I set the 'value' property to 0.",
        "speak": "I will use the 'evm_send' command to send a zero value transaction to my wallet address."
    },
    "command": {
        "name": "evm_send",
        "args": {
            "to": "0x2eA4517e5559939C4Ac35F3b6d6e537051F225fD",
            "value": 0
        }
    }
}
{
    "thoughts": {
        "text": "I will use the 'print' command to print the transaction hash.",
        "reasoning": "I need to print the transaction hash to verify that the transaction was successful.",
        "plan": "- Use 'print' command to print the transaction hash",
        "criticism": "I need to make sure that I copy the transaction hash correctly.",
        "speak": "I will use the 'print' command to print the transaction hash."
    },
    "command": {
        "name": "print",
        "args": {
            "input": "0x255b4aa0f9756a588f9ab71a4f275ce38aa5fe603aa0c8355867ab9738f830c1"
        }
    }
}
0x255b4aa0f9756a588f9ab71a4f275ce38aa5fe603aa0c8355867ab9738f830c1
I have completed all the objectives. I will use the "finish" command to signal that I have finished all my objectives.

{
    "thoughts": {
        "text": "I have completed all the objectives. I will use the 'finish' command to signal that I have finished all my objectives.",
        "reasoning": "I have completed all the objectives and there are no more tasks to be done.",
        "plan": "- Use 'finish' command to signal that I have finished all my objectives",
        "criticism": "I need to make sure that I have completed all the objectives before using the 'finish' command.",
        "speak": "I have completed all the objectives. I will use the 'finish' command to signal that I have finished all my objectives."
    },
    "command": {
        "name": "finish",
        "args": {
            "response": "I have finished all my objectives."
        }
    }
}
```

## 🚀 Usage - [OpenAI API](https://openai.com/blog/openai-api)

### 1. Clone this repo

```bash
git clone https://github.com/junhoyeo/CryptoGPT
```

### 2. Configurate `${project-root}/.env`

```bash
OPENAI_API_KEY=sk-*****
WALLET_PRIVATE_KEY=0x*****
OPENAI_API_BASE_PATH=
JSON_RPC_URL=
```

## 🚀 Usage - `gpt4free` (WIP)

### 1. Clone this repo

```bash
git clone --recurse-submodules -j8 https://github.com/junhoyeo/CryptoGPT
```

### 2. Setup [`gpt4free`](https://github.com/xtekky/gpt4free)

```bash
cd gpt4free
```

```bash
python3 -m venv venv

chmod +x venv/bin/activate
venv/bin/activate

pip3 install -r requirements.txt
```

```bash
cd .. # back to project root
```

### 3. Run `gpt4free` -> `OpenAI API Proxy`

```
python3 gpt4free-openai-proxy/main.py
```

### 4. Configure `${project-root}/.env`

```bash
OPENAI_API_KEY=sk-*****
WALLET_PRIVATE_KEY=0x*****
OPENAI_API_BASE_PATH=http://127.0.0.1:5000
JSON_RPC_URL=
```
