<img src=".github/logo.png" width="400" />

<h1>
  ✸ CryptoGPT — <br />
  An experiment for <code>🤖 LLMs</code> <br />
  archiving <code>🏦 Financial Autonomy</code>
</h1>

- ✸ 🏦 **Allowing _Financial Autonomy_ to _[Sam's Children](https://en.wikipedia.org/wiki/ChatGPT)_**
- ✸ 🪪 Enabling Language Learning Models (LLMs) to **establish their own unique identities** within the blockchain.
- ✸ 🇦🇶 **Make the name _CryptoGPT_ great again.** Not affiliated with [LayerAI](https://layerai.org/) or any other (scammy) web3 projects.

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
```
