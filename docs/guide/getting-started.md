# Getting Started

## Quick Install

Download the latest release for your platform:

| Platform | Format | Download |
|----------|--------|----------|
| **Linux** | AppImage | [MeSame-0.1.0.AppImage](https://github.com/openhoat/mesame/releases/latest/download/MeSame-0.1.0.AppImage) |
| **macOS** | DMG (ARM) | [MeSame-0.1.0-arm64.dmg](https://github.com/openhoat/mesame/releases/latest/download/MeSame-0.1.0-arm64.dmg) |
| **Windows** | Installer | [MeSame.Setup.0.1.0.exe](https://github.com/openhoat/mesame/releases/latest/download/MeSame.Setup.0.1.0.exe) |

> See all versions on the [Releases page](https://github.com/openhoat/mesame/releases).

### Linux (AppImage)

```bash
chmod +x MeSame-0.1.0.AppImage
./MeSame-0.1.0.AppImage
```

### macOS

Open the `.dmg` file and drag MeSame to your Applications folder.

### Windows

Run the `MeSame.Setup.0.1.0.exe` installer and follow the steps.

## Development Setup

If you want to run MeSame from source:

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

#### Option A — Server Only (CLI)

```bash
npm run dev
```

Server will start at `http://localhost:3000`.

#### Option B — Electron Desktop App

```bash
npm run dev:electron
```

This will:
1. Build the renderer (React UI)
2. Build the Electron main process
3. Launch the Electron window

#### Option C — Development with Hot Reload

Terminal 1 (Backend):
```bash
npm run dev
```

Terminal 2 (Frontend):
```bash
npm run dev:renderer
```

Then open `http://localhost:5173` in your browser.

## First Use

1. **Launch MeSame** (Electron app or web UI at `http://localhost:3000`)
2. **Configure Provider** — Go to Admin → Settings and select your LLM provider
3. **Upload Documents** — Go to Admin → Sources and import your documents (PDF, MD, TXT)
4. **Analyze Style** — Click "Analyze" to generate your style profile
5. **Test Chat** — Use the Chat interface to verify your style is injected

> See the [Usage guide](/guide/usage) for detailed instructions on using the admin dashboard and chat interface.
