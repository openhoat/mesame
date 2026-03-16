export interface AppConfig {
  port: number
  host: string
  targetBaseUrl: string
  targetApiKey: string | undefined
  logLevel: string
}

export function loadConfig(): AppConfig {
  return {
    port: Number(process.env.PORT) || 3000,
    host: process.env.HOST ?? '127.0.0.1',
    targetBaseUrl: process.env.TARGET_BASE_URL ?? 'https://api.openai.com',
    targetApiKey: process.env.TARGET_API_KEY,
    logLevel: process.env.LOG_LEVEL ?? 'info',
  }
}

export const config = loadConfig()
