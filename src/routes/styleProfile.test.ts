import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { buildApp } from '../app.js'
import { resetConfig } from '../config.js'
import * as styleProfileService from '../services/styleProfileService.js'

vi.mock('../services/styleProfileService.js')

// Mock userSettingsService
vi.mock('../services/userSettingsService.js', () => ({
  getUserSettings: vi.fn().mockResolvedValue({
    id: 1,
    language: null,
    llmUrl: null,
    logLevel: null,
    optimizationsEnabled: false,
    slidingWindowSize: 10,
  }),
}))

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
    test('should return all profiles', async () => {
      const now = new Date()
      const mockProfiles = [
        {
          id: 'profile-1',
          name: 'Profile 1',
          personaPrompt: 'Prompt 1',
          metrics: '{}',
          isActive: true,
          createdAt: now,
          updatedAt: now,
          sources: [],
        },
      ]
      vi.mocked(styleProfileService.getAllProfiles).mockResolvedValueOnce(mockProfiles)

      const response = await app.inject({
        method: 'GET',
        url: '/api/style-profile',
      })

      expect(response.statusCode).toBe(200)
      const result = response.json()
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        id: 'profile-1',
        name: 'Profile 1',
        personaPrompt: 'Prompt 1',
        isActive: true,
      })
    })
  })

  describe('GET /api/style-profile/:id', () => {
    test('should return profile by id', async () => {
      const mockProfile = {
        id: 'profile-1',
        name: 'Profile 1',
        personaPrompt: 'Prompt 1',
        metrics: '{}',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        sources: [],
      }
      vi.mocked(styleProfileService.getProfileById).mockResolvedValueOnce(mockProfile)

      const response = await app.inject({
        method: 'GET',
        url: '/api/style-profile/profile-1',
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toMatchObject({ id: 'profile-1', name: 'Profile 1' })
    })

    test('should return 500 when profile not found', async () => {
      vi.mocked(styleProfileService.getProfileById).mockResolvedValueOnce(null)

      const response = await app.inject({
        method: 'GET',
        url: '/api/style-profile/nonexistent',
      })

      expect(response.statusCode).toBe(500)
    })
  })

  describe('POST /api/style-profile', () => {
    test('should create new profile', async () => {
      const mockProfile = {
        id: 'profile-1',
        name: 'New Profile',
        personaPrompt: 'Prompt',
        metrics: '{}',
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        sources: [],
      }
      vi.mocked(styleProfileService.createProfile).mockResolvedValueOnce(mockProfile)

      const response = await app.inject({
        method: 'POST',
        url: '/api/style-profile',
        payload: {
          name: 'New Profile',
          sourceIds: ['source-1'],
        },
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toMatchObject({ name: 'New Profile' })
    })
  })

  describe('PUT /api/style-profile/:id', () => {
    test('should update profile', async () => {
      const mockProfile = {
        id: 'profile-1',
        name: 'Updated Profile',
        personaPrompt: 'Prompt',
        metrics: '{}',
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        sources: [],
      }
      vi.mocked(styleProfileService.updateProfile).mockResolvedValueOnce(mockProfile)

      const response = await app.inject({
        method: 'PUT',
        url: '/api/style-profile/profile-1',
        payload: {
          name: 'Updated Profile',
        },
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toMatchObject({ name: 'Updated Profile' })
    })
  })

  describe('DELETE /api/style-profile/:id', () => {
    test('should delete profile', async () => {
      vi.mocked(styleProfileService.deleteProfile).mockResolvedValueOnce()

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/style-profile/profile-1',
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toEqual({ success: true })
    })
  })

  describe('POST /api/style-profile/:id/activate', () => {
    test('should activate profile', async () => {
      const mockProfile = {
        id: 'profile-1',
        name: 'Profile 1',
        personaPrompt: 'Prompt',
        metrics: '{}',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        sources: [],
      }
      vi.mocked(styleProfileService.activateProfile).mockResolvedValueOnce(mockProfile)

      const response = await app.inject({
        method: 'POST',
        url: '/api/style-profile/profile-1/activate',
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toMatchObject({ isActive: true })
    })
  })

  describe('POST /api/style-profile/:id/regenerate', () => {
    test('should regenerate profile', async () => {
      const mockProfile = {
        id: 'profile-1',
        name: 'Profile 1',
        personaPrompt: 'New Prompt',
        metrics: '{}',
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        sources: [],
      }
      vi.mocked(styleProfileService.regenerateProfile).mockResolvedValueOnce(mockProfile)

      const response = await app.inject({
        method: 'POST',
        url: '/api/style-profile/profile-1/regenerate',
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toMatchObject({ personaPrompt: 'New Prompt' })
    })
  })

  describe('GET /api/style-profile/export', () => {
    test('should export all profiles with metadata', async () => {
      const now = new Date()
      const mockProfiles = [
        {
          id: 'profile-1',
          name: 'Profile 1',
          personaPrompt: 'Prompt 1',
          metrics: '{}',
          isActive: true,
          createdAt: now,
          updatedAt: now,
          sources: [{ id: 'source-1', title: 'Source 1' }],
        },
        {
          id: 'profile-2',
          name: 'Profile 2',
          personaPrompt: 'Prompt 2',
          metrics: '{}',
          isActive: false,
          createdAt: now,
          updatedAt: now,
          sources: [],
        },
      ]
      vi.mocked(styleProfileService.getAllProfiles).mockResolvedValueOnce(mockProfiles)

      const response = await app.inject({
        method: 'GET',
        url: '/api/style-profile/export',
      })

      expect(response.statusCode).toBe(200)
      const result = response.json()
      expect(result).toHaveProperty('exportedAt')
      expect(result).toHaveProperty('version', '1.0')
      expect(result).toHaveProperty('count', 2)
      expect(result).toHaveProperty('profiles')
      expect(result.profiles).toHaveLength(2)
      expect(result.profiles[0]).toMatchObject({
        id: 'profile-1',
        name: 'Profile 1',
      })
    })
  })
})
