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

## Why MeSame?

Every LLM has its own voice — GPT sounds like GPT, Claude sounds like Claude. But what if you want the AI to sound like **you**?

MeSame captures **your** writing style — tone, syntax, vocabulary patterns — and injects it as context into any model you use. Your documents stay local, your style travels everywhere.

**Use Cases:**
- Content creators maintaining consistent brand voice across AI-generated content
- Writers who want AI assistance that matches their personal style
- Teams enforcing consistent communication tone
- Privacy-conscious users who want local analysis without cloud exposure

## Features

- **Local Analysis**: Documents (PDF, MD, TXT) analyzed entirely on your machine — zero cloud exposure
- **Style Profiling**: Automatic linguistic portrait (tone, syntax, language patterns, lexical richness)
- **Universal Proxy**: OpenAI-compatible API proxy — swap your endpoint URL and any app gets your style
- **Multi-Provider Support**: Works with OpenAI (GPT-4o, GPT-4), Claude (Anthropic), Google AI (Gemini), and Ollama (local models)
- **Admin Dashboard**: Import sources, visualize detected patterns, manage API keys, browse chat logs
- **Real-time Streaming**: Server-Sent Events (SSE) support for streaming responses
- **Multi-language**: Supports 10+ languages for style detection and responses
- **CDN-Ready Frontend**: Deploy the web UI to any static hosting (Vercel, Netlify, Cloudflare Pages)

## Quick Install

### Docker (Recommended)

```bash
git clone https://github.com/openhoat/mesame.git
cd mesame
docker compose up -d
```

**Services:**
- **Web Dashboard**: `http://localhost:3000` — Admin interface for configuring providers
- **LLM API**: `http://localhost:3001` — OpenAI-compatible proxy endpoint

### Run from Source

```bash
git clone https://github.com/openhoat/mesame.git
cd mesame
npm install
npm run db:generate && npm run db:push
npm run dev
```

**Prerequisites**: Node.js 22+, npm — See [Getting Started](https://openhoat.github.io/mesame/guide/getting-started) for detailed setup.

## Roadmap

### Planned Features

- **Interactive Questionnaire** — Build your digital twin profile through guided questions
- **Voice Discussion** — Alternative questionnaire experience with voice input
- **Mobile Support** — Responsive design and optimized mobile web experience
- **Keyboard Shortcuts** — Navigate chat interface efficiently
- **Drag & Drop Upload** — Import documents with a simple drag and drop
- **Real-time Logs** — WebSocket-based live logging dashboard

### Under Consideration

- **LLM Optimizations** — Prompt compression, caching, and token efficiency improvements
- **OpenAPI Specification** — Swagger documentation for the proxy API

## Documentation

- [Getting Started](https://openhoat.github.io/mesame/guide/getting-started) — Installation and provider setup
- [Usage](https://openhoat.github.io/mesame/guide/usage) — How to use the admin dashboard and configure style profiles
- [Configuration](https://openhoat.github.io/mesame/guide/configuration) — Provider settings and environment variables
- [Architecture](https://openhoat.github.io/mesame/guide/architecture) — Project structure and design overview
- [Troubleshooting](https://openhoat.github.io/mesame/guide/troubleshooting) — Common issues and solutions
- [Contributing](https://openhoat.github.io/mesame/guide/contributing) — How to contribute to the project
- [Changelog](https://github.com/openhoat/mesame/blob/main/CHANGELOG.md) — Version history and release notes

## Security & Privacy

MeSame is designed with a local-first philosophy to protect your data.

- **Zero-Cloud Analysis**: Document parsing and style analysis run entirely on your machine
- **Local-First**: The proxy server binds to `localhost` by default, ensuring no external network access
- **Data Protection**: Your style profiles are stored in a local SQLite database — no telemetry or usage data collected
- **CORS Protection**: Configure allowed origins for production deployment
- **API Keys**: Keys are stored locally in environment files or database

For security vulnerabilities, please contact: openhoat@gmail.com

## License

This project is licensed under the MIT License - see the [LICENSE.txt](LICENSE.txt) file for details.

Copyright © 2026 Olivier Penhoat

## Author

Olivier Penhoat <openhoat@gmail.com>

## Acknowledgments

- The LangChain team for their excellent AI orchestration framework
- Anthropic, OpenAI, Google, and Ollama for their LLM platforms
- The open-source community for the tools that made this possible