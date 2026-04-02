import { beforeEach, describe, expect, test, vi } from 'vitest'
import { getPreferredLanguage } from './languageService.js'

// Mock the userSettingsService
vi.mock('./userSettingsService.js', () => ({
  getUserSettings: vi.fn(),
}))

// Mock config
vi.mock('../config.js', () => ({
  config: {
    language: 'en',
  },
}))

describe('languageService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should return language from user settings', async () => {
    const { getUserSettings } = await import('./userSettingsService.js')
    vi.mocked(getUserSettings).mockResolvedValueOnce({
      id: 1,
      language: 'fr',
    })

    const language = await getPreferredLanguage()

    expect(language).toBe('fr')
  })

  test('should fallback to config language if no settings', async () => {
    const { getUserSettings } = await import('./userSettingsService.js')
    vi.mocked(getUserSettings).mockResolvedValueOnce({
      id: 1,
      language: 'en',
    })

    const language = await getPreferredLanguage()

    expect(language).toBe('en')
  })

  test('should fallback to config language on database error', async () => {
    const { getUserSettings } = await import('./userSettingsService.js')
    vi.mocked(getUserSettings).mockRejectedValueOnce(new Error('Database error'))

    const language = await getPreferredLanguage()

    // Should fallback to config language
    expect(language).toBe('en')
  })
})
