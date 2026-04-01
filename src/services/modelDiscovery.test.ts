import { beforeEach, describe, expect, test, vi } from 'vitest'
import { listProviderModels } from './modelDiscovery.js'

// Mock fetch for external API calls
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('modelDiscovery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('listProviderModels', () => {
    test('should return static models for anthropic provider', async () => {
      const provider = {
        id: 1,
        type: 'anthropic' as const,
        name: 'anthropic',
        displayName: 'Anthropic',
        baseUrl: 'https://api.anthropic.com',
        apiKey: null,
        enabled: true,
        priority: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const models = await listProviderModels(provider)

      expect(models).toBeInstanceOf(Array)
      expect(models.length).toBeGreaterThan(0)
      expect(models[0]).toHaveProperty('id')
      expect(models[0]).toHaveProperty('object', 'model')
      expect(models[0]).toHaveProperty('created')
      expect(models[0]).toHaveProperty('owned_by', 'anthropic')
    })

    test('should return static models for google provider', async () => {
      const provider = {
        id: 2,
        type: 'google' as const,
        name: 'google',
        displayName: 'Google',
        baseUrl: 'https://generativelanguage.googleapis.com',
        apiKey: null,
        enabled: true,
        priority: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const models = await listProviderModels(provider)

      expect(models).toBeInstanceOf(Array)
      expect(models.length).toBeGreaterThan(0)
      expect(models[0]).toHaveProperty('id')
      expect(models[0]).toHaveProperty('owned_by', 'google')
    })

    test('should fetch models from OpenAI-compatible mock provider', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          object: 'list',
          data: [
            {
              id: 'mock-model',
              object: 'model',
              created: 1704067200,
              owned_by: 'mesame',
            },
          ],
        }),
      })

      const provider = {
        id: 3,
        type: 'openai' as const,
        name: 'mock',
        displayName: 'Mock',
        baseUrl: 'http://localhost:3000',
        apiKey: null,
        enabled: true,
        priority: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const models = await listProviderModels(provider)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/models',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
      expect(models).toBeInstanceOf(Array)
      expect(models.length).toBe(1)
      expect(models[0]).toHaveProperty('id', 'mock-model')
      expect(models[0]).toHaveProperty('owned_by', 'mesame')
    })

    test('should fetch models from Ollama API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          models: [
            {
              name: 'llama3.2:latest',
              modified_at: '2024-01-01T00:00:00Z',
              size: 1000000000,
            },
          ],
        }),
      })

      const provider = {
        id: 4,
        type: 'ollama' as const,
        name: 'ollama',
        displayName: 'Ollama',
        baseUrl: 'http://localhost:11434',
        apiKey: null,
        enabled: true,
        priority: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const models = await listProviderModels(provider)

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:11434/api/tags')
      expect(models).toBeInstanceOf(Array)
      expect(models[0]).toHaveProperty('id', 'llama3.2:latest')
      expect(models[0]).toHaveProperty('owned_by', 'ollama')
    })

    test('should fetch models from OpenAI-compatible API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          object: 'list',
          data: [
            {
              id: 'gpt-4o',
              object: 'model',
              created: 1686935002,
              owned_by: 'openai',
            },
          ],
        }),
      })

      const provider = {
        id: 5,
        type: 'openai' as const,
        name: 'openai',
        displayName: 'OpenAI',
        baseUrl: 'https://api.openai.com',
        apiKey: 'test-api-key',
        enabled: true,
        priority: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const models = await listProviderModels(provider)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/models',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-api-key',
          }),
        })
      )
      expect(models).toBeInstanceOf(Array)
      expect(models[0]).toHaveProperty('id', 'gpt-4o')
      expect(models[0]).toHaveProperty('owned_by', 'openai')
    })

    test('should treat unknown provider type as OpenAI-compatible', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          object: 'list',
          data: [
            {
              id: 'custom-model',
              object: 'model',
              created: 1686935002,
              owned_by: 'custom',
            },
          ],
        }),
      })

      const provider = {
        id: 99,
        type: 'custom' as const,
        name: 'custom-provider',
        displayName: 'Custom Provider',
        baseUrl: 'https://api.custom.com',
        apiKey: 'custom-key',
        enabled: true,
        priority: 99,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // @ts-expect-error Testing custom provider type
      const models = await listProviderModels(provider)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.custom.com/v1/models',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer custom-key',
          }),
        })
      )
      expect(models).toBeInstanceOf(Array)
      expect(models[0]).toHaveProperty('id', 'custom-model')
    })
  })
})
