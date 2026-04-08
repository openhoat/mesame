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
  resolveProviderType: vi.fn().mockResolvedValue('openai'),
  applyCacheControl: vi.fn(messages => messages),
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
    logLevel: null,
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

// Mock the response cache
vi.mock('../services/responseCache.js', () => ({
  getCachedResponse: vi.fn().mockReturnValue(undefined),
  setCachedResponse: vi.fn(),
}))

// Mock the conversation summarizer
vi.mock('../services/conversationSummarizer.js', () => ({
  summarizeDroppedMessages: vi.fn().mockResolvedValue(''),
}))

// Mock the token usage extractor
vi.mock('../services/tokenUsage.js', () => ({
  extractTokenUsage: vi.fn().mockReturnValue({
    prompt_tokens: 10,
    completion_tokens: 20,
    total_tokens: 30,
  }),
  extractStreamingTokenUsage: vi.fn().mockReturnValue(undefined),
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
    expect(body.usage.prompt_tokens).toBe(10)
    expect(body.usage.completion_tokens).toBe(20)
    expect(body.usage.total_tokens).toBe(30)
    expect(mockInvoke).toHaveBeenCalledOnce()
  })

  test('should forward temperature and max_tokens to model', async () => {
    mockInvoke.mockResolvedValueOnce(new AIMessage('Response'))

    const { getChatModelFromModelId } = await import('../services/llmProvider.js')

    const response = await app.inject({
      method: 'POST',
      url: '/v1/chat/completions',
      payload: { ...requestBody, temperature: 0.7, max_tokens: 100 },
    })

    expect(response.statusCode).toBe(200)
    expect(getChatModelFromModelId).toHaveBeenCalledWith('ollama/test-model', false, {
      temperature: 0.7,
      maxTokens: 100,
    })
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
    // Response may be double-serialized due to reply.send, parse carefully
    const rawBody = response.body
    const parsed = JSON.parse(rawBody)
    expect(parsed.error.message).toBe('LangChain error')
    expect(parsed.error.type).toBe('langchain_error')
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

  test('should return cached response when optimizations enabled', async () => {
    const { getCachedResponse } = await import('../services/responseCache.js')
    const { getUserSettings } = await import('../services/userSettingsService.js')

    // Use mockResolvedValue (not Once) because getUserSettings is called multiple times
    vi.mocked(getUserSettings).mockResolvedValue({
      id: 1,
      language: null,
      llmUrl: null,
      logLevel: null,
      optimizationsEnabled: true,
      slidingWindowSize: 10,
    })

    vi.mocked(getCachedResponse).mockReturnValueOnce({
      content: 'Cached response',
      usage: { prompt_tokens: 5, completion_tokens: 10, total_tokens: 15 },
      timestamp: Date.now(),
      model: 'ollama/test-model',
    })

    const response = await app.inject({
      method: 'POST',
      url: '/v1/chat/completions',
      payload: requestBody,
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.choices[0].message.content).toBe('Cached response')
    expect(body.usage.total_tokens).toBe(15)
    expect(mockInvoke).not.toHaveBeenCalled()
  })
})
