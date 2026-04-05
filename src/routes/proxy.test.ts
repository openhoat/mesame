import { AIMessage } from '@langchain/core/messages'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { buildApp } from '../app.js'
import { resetConfig } from '../config.js'
import type { ChatCompletionRequest } from '../types/openai.js'

// Mock the styleProfileService to return no style profile by default
vi.mock('../services/styleProfileService.js', () => ({
  getActiveStyleProfile: vi.fn().mockResolvedValue(null),
  ensureDefaultProfile: vi.fn().mockResolvedValue(undefined),
}))

// Mock the LLM provider
const mockInvoke = vi.fn()
const mockStream = vi.fn()

vi.mock('../services/llmProvider.js', () => ({
  getChatModelFromModelId: vi.fn(() => ({
    invoke: mockInvoke,
    stream: mockStream,
  })),
  convertToLangChainMessages: vi.fn(messages =>
    messages.map((msg: { role: string; content: string }) => ({
      content: msg.content,
      role: msg.role,
    }))
  ),
}))

// Mock the modelDiscovery service
vi.mock('../services/modelDiscovery.js', () => ({
  listAllModels: vi.fn().mockResolvedValue([
    {
      id: 'ollama/test-model',
      object: 'model',
      created: 1704067200,
      owned_by: 'ollama',
    },
  ]),
}))

// Mock the userSettingsService
vi.mock('../services/userSettingsService.js', () => ({
  getUserSettings: vi.fn().mockResolvedValue({
    id: 1,
    language: null,
    llmUrl: null,
    optimizationsEnabled: false,
    slidingWindowSize: 10,
  }),
  updateUserSettings: vi.fn(),
}))

// Mock the providerRegistry service
vi.mock('../services/providerRegistry.js', () => ({
  getAllProviders: vi.fn().mockResolvedValue([
    {
      id: 1,
      name: 'ollama',
      displayName: 'Ollama',
      baseUrl: 'http://localhost:11434',
      apiKey: null,
      enabled: true,
      priority: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  getDefaultProvider: vi.fn().mockResolvedValue({
    id: 1,
    name: 'ollama',
    displayName: 'Ollama',
    baseUrl: 'http://localhost:11434',
    apiKey: null,
    enabled: true,
    priority: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  findProvider: vi.fn().mockResolvedValue({
    id: 1,
    name: 'ollama',
    displayName: 'Ollama',
    baseUrl: 'http://localhost:11434',
    apiKey: null,
    enabled: true,
    priority: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
}))

describe('proxy route', () => {
  let app: Awaited<ReturnType<typeof buildApp>>

  beforeEach(async () => {
    vi.clearAllMocks()
    resetConfig()
    app = await buildApp()
  })

  afterEach(async () => {
    await app.close()
  })

  const requestBody: ChatCompletionRequest = {
    model: 'ollama/test-model',
    messages: [{ role: 'user', content: 'Hello' }],
  }

  test('should forward non-streaming request to LangChain', async () => {
    mockInvoke.mockResolvedValueOnce(new AIMessage('Hi there!'))

    const response = await app.inject({
      method: 'POST',
      url: '/v1/chat/completions',
      payload: requestBody,
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.choices[0].message.content).toBe('Hi there!')
    expect(body.choices[0].message.role).toBe('assistant')
    expect(mockInvoke).toHaveBeenCalledOnce()
  })

  test('should forward streaming request with SSE headers', async () => {
    async function* mockGenerator() {
      yield new AIMessage({ content: 'Hello', id: '1' })
      yield new AIMessage({ content: ' world', id: '2' })
    }

    mockStream.mockResolvedValueOnce(mockGenerator())

    const response = await app.inject({
      method: 'POST',
      url: '/v1/chat/completions',
      payload: { ...requestBody, stream: true },
    })

    expect(response.statusCode).toBe(200)
    expect(response.headers['content-type']).toBe('text/event-stream')
    expect(response.body).toContain('data:')
    expect(response.body).toContain('[DONE]')
    expect(mockStream).toHaveBeenCalledOnce()
  })

  test('should handle LangChain errors', async () => {
    mockInvoke.mockRejectedValueOnce(new Error('LangChain error'))

    const response = await app.inject({
      method: 'POST',
      url: '/v1/chat/completions',
      payload: requestBody,
    })

    expect(response.statusCode).toBe(500)
    const body = response.json()
    expect(body.error.message).toBe('LangChain error')
    expect(body.error.type).toBe('langchain_error')
  })

  test('should return available models list', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/v1/models',
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.object).toBe('list')
    expect(body.data).toBeInstanceOf(Array)
    expect(body.data.length).toBeGreaterThan(0)
    expect(body.data[0]).toHaveProperty('id')
    expect(body.data[0]).toHaveProperty('object', 'model')
    expect(body.data[0]).toHaveProperty('created')
    expect(body.data[0]).toHaveProperty('owned_by')
  })

  test('should return 400 when model is missing in chat completions request', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/chat/completions',
      payload: {
        messages: [{ role: 'user', content: 'Hello' }],
      },
    })

    expect(response.statusCode).toBe(400)
    const body = response.json()
    expect(body.error.message).toBe('Missing required field: model')
    expect(body.error.type).toBe('invalid_request_error')
    expect(body.error.param).toBe('model')
  })
})
