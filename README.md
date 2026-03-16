# MeSame - Your Personal Style Proxy

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-22-339933.svg?logo=node.js&logoColor=white)
![Tested with Vitest](https://img.shields.io/badge/tested%20with-Vitest-6E9F18.svg?logo=vitest&logoColor=white)

> **"The AI that writes like me, for me."**

MeSame is a local meta-agent that analyzes your linguistic fingerprint and transforms any LLM (OpenAI, Claude, Ollama) into a faithful digital twin.

> This project is entirely built with AI — from architecture to code, tests, and documentation.

## Why MeSame?

Every LLM has its own voice. MeSame captures **your** writing style — tone, syntax, vocabulary patterns — and injects it as context into any model you use. Your documents stay local, your style travels everywhere.

## Features

- **Local Analysis**: Documents (PDF, MD, TXT) analyzed entirely on your machine — zero cloud exposure
- **Style Profiling**: Automatic linguistic portrait (tone, syntax, language patterns, lexical richness)
- **Universal Proxy**: OpenAI-compatible API proxy — swap your endpoint URL and any app gets your style
- **Model Freedom**: Switch between GPT-4, Claude, Ollama without losing personalization
- **Admin Dashboard**: Import sources, visualize detected patterns, manage API keys
- **Live Logs**: Real-time proxy request monitoring for debugging

## Architecture

### MeSame Engine (Local)

1. **Extraction**: Statistical analysis of word frequencies (TF-IDF) and key expressions (N-Grams)
2. **Linguistics**: Structure metrics (sentence length, lexical richness)
3. **Prompt Generation**: Automatic synthesis of a style System Prompt

### MeSame Proxy (Gateway)

OpenAI-compatible intermediate server:
1. **Intercept**: Receives `POST /v1/chat/completions` requests
2. **Inject**: Adds the style profile to context
3. **Route**: Forwards to target LLM (Cloud or Local via Ollama)
4. **Stream**: Handles real-time response streaming (SSE)

## Tech Stack

| Component | Technology |
| :--- | :--- |
| **Language** | TypeScript (Fullstack) |
| **Frontend** | React.js + Vite + Tailwind CSS + Shadcn/UI |
| **Backend** | Node.js + Fastify (Proxy & API) |
| **AI Orchestration** | LangChain.js |
| **NLP Local** | Natural & Compromise.js |
| **Database** | SQLite + Prisma ORM |

## Getting Started

```bash
git clone https://github.com/openhoat/mesame.git
cd mesame
npm install
npm run dev
```

**Prerequisites**: Node.js 22+, npm

## Security

- **Zero-Cloud Analysis**: Document analysis is strictly local
- **Anonymization**: Optional regex-based replacement rules to mask sensitive data before sending to LLM
- **Local Proxy**: Server responds only to local calls (`127.0.0.1`)

## License

This project is licensed under the MIT License - see the [LICENSE.txt](LICENSE.txt) file for details.

Copyright 2026 Olivier Penhoat

## Author

Olivier Penhoat <openhoat@gmail.com>
