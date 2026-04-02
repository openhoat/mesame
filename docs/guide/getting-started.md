# Getting Started

## Quick Install

### Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/openhoat/mesame.git
cd mesame

# Start both services
docker compose up -d

# View logs
docker compose logs -f
```

**Services:**
- **Web Dashboard**: `http://localhost:3000` — Admin interface for configuring providers
- **LLM API**: `http://localhost:3001` — OpenAI-compatible proxy endpoint

### Run from Source

If you want to run MeSame from source:

## Development Setup

### Prerequisites

- **Node.js 22+** and npm
- **LLM Provider** (one or more):
  - OpenAI API key
  - Anthropic API key (Claude)
  - Google AI API key (Gemini)
  - Ollama installed locally

### Clone and Install

```bash
git clone https://github.com/openhoat/mesame.git
cd mesame
npm install
```

### Configure Provider

MeSame supports multiple LLM providers. Choose one (or configure multiple):

#### Option A — OpenAI

Get an API key from [platform.openai.com](https://platform.openai.com) and set it as an environment variable:

```bash
export OPENAI_API_KEY=sk-...
export MESAME_PROVIDER=openai
export MESAME_MODEL=gpt-4o
```

#### Option B — Claude (Anthropic)

Get an API key from [console.anthropic.com](https://console.anthropic.com) and configure:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
export MESAME_PROVIDER=anthropic
export MESAME_MODEL=claude-3-5-sonnet-20241022
```

#### Option C — Google AI (Gemini)

Get an API key from [aistudio.google.com](https://aistudio.google.com) and configure:

```bash
export GOOGLE_API_KEY=...
export MESAME_PROVIDER=google
export MESAME_MODEL=gemini-1.5-pro
```

#### Option D — Ollama (Local)

Install Ollama from [ollama.ai](https://ollama.ai) and pull a model:

```bash
ollama serve
ollama pull llama3.2:3b
```

Then configure MeSame:

```bash
export MESAME_PROVIDER=ollama
export MESAME_MODEL=llama3.2:3b
```

### Initialize Database

```bash
npm run db:generate
npm run db:push
```

### Run the Application

#### Option A — Both Servers (Recommended for Development)

```bash
npm run dev
```

This starts both the LLM proxy server and the web dashboard with hot reload:
- **Web Dashboard**: `http://localhost:3000`
- **LLM API**: `http://localhost:3001`

#### Option B — Individual Servers

Terminal 1 (LLM Server):
```bash
npm run dev:llm
```

Terminal 2 (Web Server):
```bash
npm run dev:web
```

## First Use

1. **Launch MeSame** — Open `http://localhost:3000` in your browser
2. **Configure Provider** — Go to Admin → Settings and select your LLM provider
3. **Upload Documents** — Go to Admin → Sources and import your documents (PDF, MD, TXT)
4. **Analyze Style** — Click "Analyze" to generate your style profile
5. **Test Chat** — Use the Chat interface to verify your style is injected

> See the [Usage guide](/guide/usage) for detailed instructions on using the admin dashboard and chat interface.
