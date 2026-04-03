import { config } from '../config.js'
import { getUserSettings } from './userSettingsService.js'

/**
 * Get the preferred language from user settings, with fallback to env config
 * Returns null if no language preference is set (letting the LLM decide)
 */
export async function getPreferredLanguage(): Promise<string | null> {
  try {
    const settings = await getUserSettings()
    // Return the user's language preference, or null if not set
    return settings.language
  } catch {
    // Fallback to config if database is unavailable
    return config.language === 'en' ? null : config.language
  }
}
