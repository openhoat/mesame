import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { buildApp } from '../app.js'
import type { ChatCompletionRequest, ChatCompletionResponse } from '../types/openai.js'

describe('proxy route', () => {
  let app: Awaited<ReturnType<typeof buildApp>>
  const fetchSpy = vi.spyOn(globalThis, 'fetch')

  beforeEach(async () => {
    app = await buildApp()
    vi.clearAllMocks()
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

    // When targetApiKey is undefined (default), no authorization header is set
    if (process.env.TARGET_API_KEY) {
      expect(headers.authorization).toContain('Bearer')
    } else {
      expect(headers.authorization).toBeUndefined()
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
})
