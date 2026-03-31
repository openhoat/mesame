import { Writable } from 'node:stream'
import pino from 'pino'
import type { AppConfig } from './config.js'
import { logBuffer } from './services/logBuffer.js'

// Custom stream that captures logs for the buffer
class LogBufferStream extends Writable {
  override _write(chunk: Buffer, _encoding: string, callback: () => void) {
    try {
      const logObj = JSON.parse(chunk.toString())
      logBuffer.add({
        timestamp: new Date(logObj.time || Date.now()).toISOString(),
        level: logObj.level ? pino.levels.labels[logObj.level] || 'info' : 'info',
        message: logObj.msg || '',
      })
    } catch {
      // Ignore parsing errors
    }
    callback()
  }
}

export function createLogger(logLevel: string = 'info') {
  const streams = [
    // Stream 1: pino-pretty for console
    {
      level: logLevel,
      stream: pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
          messageFormat: '{msg}',
        },
      }),
    },
    // Stream 2: custom stream for log buffer
    {
      level: logLevel,
      stream: new LogBufferStream(),
    },
  ]

  return pino({ level: logLevel }, pino.multistream(streams))
}

export const logger = createLogger(process.env.MESAME_LOG_LEVEL || 'info')

export function logConfiguration(config: AppConfig): void {
  const line = '─'.repeat(80)

  logger.info('')
  logger.info(`╭${line}╮`)
  logger.info(`│${' '.repeat(30)}🔧 MESAME CONFIGURATION${' '.repeat(29)}│`)
  logger.info(`╰${line}╯`)
  logger.info('')

  logger.info('📡 LLM Server:')
  logger.info(`   • Host: ${config.llmHost}`)
  logger.info(`   • Port: ${config.llmPort}`)
  logger.info(`   • URL:  http://${config.llmHost}:${config.llmPort}`)
  logger.info('')

  logger.info('🤖 LLM Provider:')
  logger.info(`   • Provider: ${config.provider}`)
  logger.info(`   • Model:    ${config.model}`)
  logger.info(`   • Base URL: ${config.targetBaseUrl}`)
  logger.info(
    `   • API Key:  ${config.targetApiKey ? `***${config.targetApiKey.slice(-4)}` : '(none)'}`
  )
  logger.info('')

  logger.info('💾 Database:')
  const dbUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db'
  logger.info(`   • URL: ${dbUrl}`)
  logger.info('')

  logger.info('⚙️  Application:')
  logger.info(`   • Log Level: ${config.logLevel}`)
  logger.info(`   • Language:  ${config.language}`)
  logger.info(`   • Node ENV:  ${process.env.NODE_ENV || 'development'}`)
  logger.info('')

  const envVars = Object.keys(process.env)
    .filter(key => key.startsWith('MESAME_'))
    .sort()

  if (envVars.length > 0) {
    logger.info('🔐 Environment Variables:')
    for (const key of envVars) {
      const value = process.env[key]
      const isSensitive = key.includes('KEY') || key.includes('TOKEN') || key.includes('SECRET')
      const displayValue = isSensitive
        ? value
          ? `***${value.slice(-4)}`
          : '(not set)'
        : value || '(not set)'
      logger.info(`   • ${key}: ${displayValue}`)
    }
    logger.info('')
  }

  logger.info(`╰${line}╯`)
  logger.info('')
}
