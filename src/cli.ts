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
    .description('MeSame - Your personal style proxy for LLMs')
    .version(version)
    .option('-p, --port <number>', 'Port to listen on', value => Number.parseInt(value, 10))
    .option('-h, --host <string>', 'Host to bind to')
    .option(
      '--provider <provider>',
      'LLM provider (openai, anthropic, google, ollama, mock)',
      validateProvider
    )
    .option('-m, --model <string>', 'Model to use')
    .option('-u, --target-base-url <url>', 'Target API base URL')
    .option(
      '-l, --log-level <level>',
      'Log level (fatal, error, warn, info, debug, trace, silent)',
      validateLogLevel
    )
    .option('--language <code>', 'Language code (e.g., en, fr)')

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

    // Import and start server (dynamic import to ensure env vars are set first)
    const { startServer } = await import('./server.js')
    await startServer()
  } catch (error) {
    if (error instanceof Error) {
      process.stderr.write(`Error: ${error.message}\n`)
    } else {
      process.stderr.write(`Error: ${String(error)}\n`)
    }
    process.exit(1)
  }
}
