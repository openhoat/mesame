import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { buildApp } from '../app.js'
import { resetConfig } from '../config.js'
import * as styleProfileService from '../services/styleProfileService.js'

vi.mock('../services/styleProfileService.js')

describe('style profile route', () => {
  let app: Awaited<ReturnType<typeof buildApp>>

  beforeEach(async () => {
    vi.clearAllMocks()
    resetConfig()
    app = await buildApp()
  })

  afterEach(async () => {
    await app.close()
  })

  describe('GET /api/style-profile', () => {
    test('should return active style profile', async () => {
      const mockProfile = { personaPrompt: 'You are MeSame' }
      vi.mocked(styleProfileService.getActiveStyleProfile).mockResolvedValueOnce(mockProfile)

      const response = await app.inject({
        method: 'GET',
        url: '/api/style-profile',
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toEqual(mockProfile)
    })

    test('should return empty prompt when no profile exists', async () => {
      vi.mocked(styleProfileService.getActiveStyleProfile).mockResolvedValueOnce(null)

      const response = await app.inject({
        method: 'GET',
        url: '/api/style-profile',
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toEqual({ personaPrompt: '' })
    })
  })

  describe('POST /api/style-profile/generate', () => {
    test('should generate and return new style profile', async () => {
      const mockProfile = { personaPrompt: 'You are MeSame with a formal tone' }
      vi.mocked(styleProfileService.generateStyleProfile).mockResolvedValueOnce(mockProfile)

      const response = await app.inject({
        method: 'POST',
        url: '/api/style-profile/generate',
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toEqual(mockProfile)
      expect(styleProfileService.generateStyleProfile).toHaveBeenCalled()
    })

    test('should handle errors when no sources available', async () => {
      vi.mocked(styleProfileService.generateStyleProfile).mockRejectedValueOnce(
        new Error('No sources available for style analysis')
      )

      const response = await app.inject({
        method: 'POST',
        url: '/api/style-profile/generate',
      })

      expect(response.statusCode).toBe(500)
    })
  })
})
