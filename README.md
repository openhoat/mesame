# MeSame - Your Personal Style Proxy

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-22-339933.svg?logo=node.js&logoColor=white)
![Tested with Vitest](https://img.shields.io/badge/tested%20with-Vitest-6E9F18.svg?logo=vitest&logoColor=white)
[![GitHub Stars](https://img.shields.io/github/stars/openhoat/mesame?style=social)](https://github.com/openhoat/mesame/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/openhoat/mesame?style=social)](https://github.com/openhoat/mesame/network/members)
[![GitHub issues](https://img.shields.io/github/issues/openhoat/mesame)](https://github.com/openhoat/mesame/issues)

> **"The AI that writes like me, for me."**

MeSame is a local meta-agent that analyzes your linguistic fingerprint and transforms any LLM (OpenAI, Claude, Ollama) into a faithful digital twin.

> 🤖 **This project was entirely built with AI** — from architecture to code, tests, and documentation.

📖 **[Full Documentation](https://openhoat.github.io/mesame/)**

## 💡 Why MeSame?

Every LLM has its own voice — GPT sounds like GPT, Claude sounds like Claude. But what if you want the AI to sound like **you**?

MeSame captures **your** writing style — tone, syntax, vocabulary patterns — and injects it as context into any model you use. Your documents stay local, your style travels everywhere.

**Use Cases:**
- Content creators maintaining consistent brand voice across AI-generated content
- Writers who want AI assistance that matches their personal style
- Teams enforcing consistent communication tone
- Privacy-conscious users who want local analysis without cloud exposure

## 🚀 Features

- **Local Analysis**: Documents (PDF, MD, TXT) analyzed entirely on your machine — zero cloud exposure
- **Style Profiling**: Automatic linguistic portrait (tone, syntax, language patterns, lexical richness)
- **Universal Proxy**: OpenAI-compatible API proxy — swap your endpoint URL and any app gets your style
- **Multi-Provider Support**: Works with OpenAI (GPT-4o, GPT-4), Claude (Anthropic), Google AI (Gemini), and Ollama (local models)
- **Admin Dashboard**: Import sources, visualize detected patterns, manage API keys, browse chat logs
- **Electron App**: Cross-platform desktop application with embedded chat interface
- **Real-time Streaming**: Server-Sent Events (SSE) support for streaming responses
- **Anonymization**: Optional regex-based rules to mask sensitive data before sending to LLM

## 🏗️ Architecture

### MeSame Engine (Local)

1. **Document Parsing**: Extracts text from PDF, Markdown, and plain text files
2. **Statistical Analysis**: TF-IDF word frequencies and N-Gram key expressions
3. **Linguistic Metrics**: Sentence length, lexical richness, tone detection
4. **Prompt Generation**: Automatic synthesis of a style System Prompt

### MeSame Proxy (Gateway)

OpenAI-compatible intermediate server:
1. **Intercept**: Receives `POST /v1/chat/completions` requests
2. **Inject**: Adds the style profile to System Prompt context
3. **Route**: Forwards to target LLM (Cloud API or Local via Ollama)
4. **Stream**: Handles real-time response streaming (SSE)

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Language** | TypeScript (Fullstack) |
| **Frontend** | React.js + Vite + Tailwind CSS + Shadcn/UI |
| **Backend** | Node.js + Fastify (Proxy & API) |
| **Desktop** | Electron (Cross-platform) |
| **AI Orchestration** | LangChain.js |
| **NLP Local** | Natural & Compromise.js |
| **Database** | SQLite + Prisma ORM |
| **Testing** | Vitest (Unit) + Playwright (E2E) |

## 📥 Quick Install

### Option A — Download Prebuilt Binaries

Download the latest release for your platform:

| Platform | Format | Download |
|----------|--------|----------|
| **Linux** | AppImage | [MeSame-0.1.0.AppImage](https://github.com/openhoat/mesame/releases/latest/download/MeSame-0.1.0.AppImage) |
| **macOS** | DMG (ARM) | [MeSame-0.1.0-arm64.dmg](https://github.com/openhoat/mesame/releases/latest/download/MeSame-0.1.0-arm64.dmg) |
| **Windows** | Installer | [MeSame.Setup.0.1.0.exe](https://github.com/openhoat/mesame/releases/latest/download/MeSame.Setup.0.1.0.exe) |

> See all versions on the [Releases page](https://github.com/openhoat/mesame/releases).

### Option B — Run from Source

```bash
git clone https://github.com/openhoat/mesame.git
cd mesame
npm install
npm run dev
```

**Prerequisites**: Node.js 22+, npm

> See the [Getting Started guide](https://openhoat.github.io/mesame/guide/getting-started) for detailed setup instructions including provider configuration.

## 📖 Documentation

- [Getting Started](https://openhoat.github.io/mesame/guide/getting-started) — Installation and provider setup
- [Usage](https://openhoat.github.io/mesame/guide/usage) — How to use the admin dashboard and configure style profiles
- [Configuration](https://openhoat.github.io/mesame/guide/configuration) — Provider settings and environment variables
- [Build Executables](https://openhoat.github.io/mesame/guide/build) — Package the app for distribution
- [Architecture](https://openhoat.github.io/mesame/guide/architecture) — Project structure and design overview
- [Troubleshooting](https://openhoat.github.io/mesame/guide/troubleshooting) — Common issues and solutions
- [Contributing](https://openhoat.github.io/mesame/guide/contributing) — How to contribute to the project
- [Changelog](https://github.com/openhoat/mesame/blob/main/CHANGELOG.md) — Version history and release notes

## 🔒 Security

- **Zero-Cloud Analysis**: Document parsing and style analysis run entirely on your machine
- **Local-First**: Proxy server binds to `127.0.0.1` only — no external access
- **Anonymization Rules**: Optional regex-based masking to remove sensitive data before LLM calls
- **No Data Retention**: Only stores your style profile locally (SQLite database)
- **API Keys**: Stored securely in local environment files or Electron secure storage

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.txt](LICENSE.txt) file for details.

Copyright © 2026 Olivier Penhoat

## 👨‍💻 Author

Olivier Penhoat <openhoat@gmail.com>

## 🙏 Acknowledgments

- The LangChain team for their excellent AI orchestration framework
- Anthropic, OpenAI, Google, and Ollama for their LLM platforms
- The open-source community for the tools that made this possible
