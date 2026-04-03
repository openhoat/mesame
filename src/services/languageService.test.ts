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

  test('should return null when no language preference is set', async () => {
    const { getUserSettings } = await import('./userSettingsService.js')
    vi.mocked(getUserSettings).mockResolvedValueOnce({
      id: 1,
      language: null,
    })

    const language = await getPreferredLanguage()

    // No language preference means let the LLM decide
    expect(language).toBeNull()
  })

  test('should fallback to null on database error when config is en', async () => {
    const { getUserSettings } = await import('./userSettingsService.js')
    vi.mocked(getUserSettings).mockRejectedValueOnce(new Error('Database error'))

    const language = await getPreferredLanguage()

    // Should fallback to null (no preference) since config.language is 'en'
    expect(language).toBeNull()
  })
})
