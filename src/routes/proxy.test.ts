import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { buildApp } from '../app.js'
import { resetConfig } from '../config.js'
import type { ChatCompletionRequest, ChatCompletionResponse } from '../types/openai.js'

// Mock the styleProfileService to return no style profile by default
vi.mock('../services/styleProfileService.js', () => ({
  getActiveStyleProfile: vi.fn().mockResolvedValue(null),
}))

describe('proxy route', () => {
  let app: Awaited<ReturnType<typeof buildApp>>
  const fetchSpy = vi.spyOn(globalThis, 'fetch')

  beforeEach(async () => {
    vi.clearAllMocks()
    resetConfig()
    app = await buildApp()
  })

  afterEach(async () => {
    await app.close()
  })

  const requestBody: ChatCompletionRequest = {
    model: 'gpt-4o',
    messages: [{ role: 'user', content: 'Hello' }],
  }

  const upstreamResponse: ChatCompletionResponse = {
    id: 'chatcmpl-123',
    object: 'chat.completion',
    created: 1700000000,
    model: 'gpt-4o',
    choices: [
      {
        index: 0,
        message: { role: 'assistant', content: 'Hi there!' },
        finish_reason: 'stop',
      },
    ],
    usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
  }

  test('should forward non-streaming request to upstream', async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify(upstreamResponse), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    )

    const response = await app.inject({
      method: 'POST',
      url: '/v1/chat/completions',
      payload: requestBody,
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual(upstreamResponse)
    expect(fetchSpy).toHaveBeenCalledOnce()
  })

  test('should forward streaming request with SSE headers', async () => {
    const sseData = 'data: {"id":"chatcmpl-123"}\n\ndata: [DONE]\n\n'
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(sseData))
        controller.close()
      },
    })

    fetchSpy.mockResolvedValueOnce(
      new Response(stream, {
        status: 200,
        headers: { 'content-type': 'text/event-stream' },
      })
    )

    const response = await app.inject({
      method: 'POST',
      url: '/v1/chat/completions',
      payload: { ...requestBody, stream: true },
    })

    expect(response.statusCode).toBe(200)
    expect(response.body).toContain('data: {"id":"chatcmpl-123"}')
  })

  test('should include Authorization header when API key is configured', async () => {
    // Set API key for this test
    const originalApiKey = process.env.OPENAI_API_KEY
    const originalProvider = process.env.MESAME_PROVIDER
    process.env.OPENAI_API_KEY = 'test-api-key'
    process.env.MESAME_PROVIDER = 'openai'
    resetConfig()
    app = await buildApp()

    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify(upstreamResponse), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    )

    await app.inject({
      method: 'POST',
      url: '/v1/chat/completions',
      payload: requestBody,
    })

    const fetchCall = fetchSpy.mock.calls[0]
    expect(fetchCall).toBeDefined()
    const fetchOptions = fetchCall![1] as RequestInit
    const headers = fetchOptions.headers as Record<string, string>
    expect(headers['content-type']).toBe('application/json')
    expect(headers.authorization).toContain('Bearer')

    // Restore original environment
    if (originalApiKey) {
      process.env.OPENAI_API_KEY = originalApiKey
    } else {
      delete process.env.OPENAI_API_KEY
    }
    if (originalProvider) {
      process.env.MESAME_PROVIDER = originalProvider
    } else {
      delete process.env.MESAME_PROVIDER
    }
  })

  test('should forward upstream error status', async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response('{"error": "rate_limit_exceeded"}', {
        status: 429,
        headers: { 'content-type': 'application/json' },
      })
    )

    const response = await app.inject({
      method: 'POST',
      url: '/v1/chat/completions',
      payload: requestBody,
    })

    expect(response.statusCode).toBe(429)
    expect(response.body).toContain('rate_limit_exceeded')
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
    expect(body.data[0]).toHaveProperty('owned_by', 'mesame')
  })
})
