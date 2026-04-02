import { config } from '../config.js'
import { getUserSettings } from './userSettingsService.js'

/**
 * Get the preferred language from user settings, with fallback to env config
 */
export async function getPreferredLanguage(): Promise<string> {
  try {
    const settings = await getUserSettings()
    return settings.language || config.language
  } catch {
    // Fallback to config if database is unavailable
    return config.language
  }
}
