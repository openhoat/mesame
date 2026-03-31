#!/usr/bin/env node
import { Command } from 'commander'
import { version } from '../package.json'
import type { Provider } from './config.js'

export interface CliOptions {
  port?: number
  host?: string
  provider?: Provider
  model?: string
  targetBaseUrl?: string
  logLevel?: string
  language?: string
}

function validateProvider(value: string): Provider {
  const validProviders: Provider[] = ['openai', 'anthropic', 'google', 'ollama', 'mock']
  if (!validProviders.includes(value as Provider)) {
    throw new Error(`Invalid provider: ${value}. Valid providers: ${validProviders.join(', ')}`)
  }
  return value as Provider
}

function validateLogLevel(value: string): string {
  const validLevels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']
  if (!validLevels.includes(value)) {
    throw new Error(`Invalid log level: ${value}. Valid levels: ${validLevels.join(', ')}`)
  }
  return value
}

export function parseCliArgs(argv: string[]): CliOptions {
  const program = new Command()

  program
    .name('mesame')
    .description(
      `MeSame Proxy Server - OpenAI-compatible LLM proxy with style injection

A local proxy that analyzes your writing style and transforms any LLM
into a faithful digital twin. Your documents stay local, your style travels
everywhere.

This command launches the proxy server only. For the web dashboard, use:
  npm run web

Supported providers:
  openai     - OpenAI (GPT-4o, GPT-4, GPT-3.5-turbo)
  anthropic  - Anthropic Claude (claude-3, claude-3.5)
  google     - Google AI (Gemini models)
  ollama     - Local models via Ollama (gemma, llama, etc.)
  mock       - Testing provider (returns fixed responses)`
    )
    .version(version)
    .option('-p, --port <number>', 'Port number for the proxy server (default: 3000)', value =>
      Number.parseInt(value, 10)
    )
    .option(
      '-h, --host <string>',
      'Host address to bind the server to (default: localhost)',
      String
    )
    .option(
      '--provider <provider>',
      'LLM provider to use (openai, anthropic, google, ollama, mock). Default: ollama',
      validateProvider
    )
    .option(
      '-m, --model <string>',
      'Model identifier (e.g., gpt-4o, claude-3-5-sonnet-20241022, gemma3:1b)',
      String
    )
    .option(
      '-u, --target-base-url <url>',
      'Override the target API base URL for the selected provider',
      String
    )
    .option(
      '-l, --log-level <level>',
      'Logging verbosity: fatal, error, warn, info, debug, trace, silent (default: info)',
      validateLogLevel
    )
    .option(
      '--language <code>',
      'Language code for responses and style detection (e.g., en, fr). Default: auto-detected',
      String
    )
    .addHelpText(
      'after',
      `
Examples:
  $ mesame                                    Start with defaults (ollama on port 3000)
  $ mesame -p 8080                            Run on port 8080
  $ mesame --provider openai --model gpt-4o   Use OpenAI GPT-4o
  $ mesame --provider anthropic               Use Anthropic Claude
  $ mesame --provider ollama -m gemma3:1b     Use Ollama with Gemma 3
  $ mesame --log-level debug                  Enable debug logging
  $ mesame -h 0.0.0.0 -p 3001                 Bind to all interfaces on port 3001

Environment variables:
  MESAME_PORT          Server port (default: 3000)
  MESAME_HOST          Server host (default: localhost)
  MESAME_PROVIDER      Default provider (default: ollama)
  MESAME_MODEL         Default model
  MESAME_TARGET_BASE_URL  Target API base URL
  MESAME_LOG_LEVEL     Log level (default: info)
  MESAME_LANGUAGE      Language code (default: auto-detected)
  OPENAI_API_KEY       API key for OpenAI
  ANTHROPIC_API_KEY    API key for Anthropic
  GOOGLE_API_KEY       API key for Google AI

Documentation:
  https://openhoat.github.io/mesame/

Repository:
  https://github.com/openhoat/mesame
`
    )

  program.parse(argv)

  const options = program.opts()

  return {
    port: options.port,
    host: options.host,
    provider: options.provider,
    model: options.model,
    targetBaseUrl: options.targetBaseUrl,
    logLevel: options.logLevel,
    language: options.language,
  }
}

export async function runCli(): Promise<void> {
  try {
    const cliOptions = parseCliArgs(process.argv)

    // Apply CLI options to environment variables (CLI options take precedence)
    if (cliOptions.port !== undefined) {
      process.env.MESAME_PORT = String(cliOptions.port)
    }
    if (cliOptions.host) {
      process.env.MESAME_HOST = cliOptions.host
    }
    if (cliOptions.provider) {
      process.env.MESAME_PROVIDER = cliOptions.provider
    }
    if (cliOptions.model) {
      process.env.MESAME_MODEL = cliOptions.model
    }
    if (cliOptions.targetBaseUrl) {
      process.env.MESAME_TARGET_BASE_URL = cliOptions.targetBaseUrl
    }
    if (cliOptions.logLevel) {
      process.env.MESAME_LOG_LEVEL = cliOptions.logLevel
    }
    if (cliOptions.language) {
      process.env.MESAME_LANGUAGE = cliOptions.language
    }

    // Import and start proxy server (dynamic import to ensure env vars are set first)
    const { startProxyServer } = await import('./proxy-server.js')
    await startProxyServer()
  } catch (error) {
    if (error instanceof Error) {
      process.stderr.write(`Error: ${error.message}\n`)
    } else {
      process.stderr.write(`Error: ${String(error)}\n`)
    }
    process.exit(1)
  }
}
