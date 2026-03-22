---
layout: home
hero:
  name: MeSame
  text: Your Personal Style Proxy
  tagline: Transform any LLM into your digital twin — locally analyze your writing style and inject it into GPT, Claude, or Ollama
  image:
    src: /logo.png
    alt: MeSame Logo
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: Download
      link: https://github.com/openhoat/mesame/releases/latest
    - theme: alt
      text: GitHub
      link: https://github.com/openhoat/mesame
features:
  - title: Local Style Analysis
    details: Analyze your documents (PDF, MD, TXT) entirely on your machine — zero cloud exposure. Your linguistic fingerprint stays private.
  - title: Multi-Provider Support
    details: Works with OpenAI, Claude, Google AI (Gemini), and Ollama. Switch providers without losing your personalization.
  - title: OpenAI-Compatible Proxy
    details: Drop-in replacement for any OpenAI-compatible app. Just change the base URL and your style follows.
  - title: Electron Desktop App
    details: Cross-platform desktop application with admin dashboard, chat interface, and real-time logs.
---

## Why MeSame?

Every LLM has its own voice — GPT sounds like GPT, Claude sounds like Claude. But what if you want the AI to sound like **you**?

MeSame captures **your** writing style — tone, syntax, vocabulary patterns — and injects it as context into any model you use. Your documents stay local, your style travels everywhere.

**Perfect for:**
- Content creators maintaining consistent brand voice
- Writers who want AI that matches their personal style
- Teams enforcing unified communication tone
- Privacy-conscious users needing local-only analysis

## How It Works

1. **Import** — Upload your documents (PDF, Markdown, plain text)
2. **Analyze** — MeSame extracts linguistic patterns (local NLP, no cloud)
3. **Profile** — Generates a style System Prompt from your writing fingerprint
4. **Proxy** — Intercepts LLM requests, injects your style, forwards to target model
5. **Result** — AI responses match **your** tone and vocabulary

> This project was entirely built with AI — from architecture to code, tests, and documentation, using [Claude Code](https://claude.ai/claude-code).
