/**
 * Mock utilities for E2E testing
 *
 * Provides mock implementations for external services
 * and test data generators.
 */

/**
 * Mock responses for OpenAI API
 */
export const mockOpenAIResponses = {
  chatCompletion: {
    id: 'chatcmpl-test-mock',
    object: 'chat.completion',
    created: Date.now(),
    model: 'gpt-4o-mock',
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: 'This is a mocked response for testing purposes.',
        },
        finish_reason: 'stop',
      },
    ],
    usage: {
      prompt_tokens: 10,
      completion_tokens: 10,
      total_tokens: 20,
    },
  },

  chatCompletionStreaming: [
    {
      id: 'chatcmpl-test-stream',
      object: 'chat.completion.chunk',
      created: Date.now(),
      model: 'gpt-4o-mock',
      choices: [
        {
          index: 0,
          delta: { role: 'assistant', content: '' },
          finish_reason: null,
        },
      ],
    },
    {
      id: 'chatcmpl-test-stream',
      object: 'chat.completion.chunk',
      created: Date.now(),
      model: 'gpt-4o-mock',
      choices: [
        {
          index: 0,
          delta: { content: 'This is a ' },
          finish_reason: null,
        },
      ],
    },
    {
      id: 'chatcmpl-test-stream',
      object: 'chat.completion.chunk',
      created: Date.now(),
      model: 'gpt-4o-mock',
      choices: [
        {
          index: 0,
          delta: { content: 'streamed response.' },
          finish_reason: null,
        },
      ],
    },
    {
      id: 'chatcmpl-test-stream',
      object: 'chat.completion.chunk',
      created: Date.now(),
      model: 'gpt-4o-mock',
      choices: [
        {
          index: 0,
          delta: {},
          finish_reason: 'stop',
        },
      ],
    },
  ],

  error: {
    error: {
      message: 'Invalid API key',
      type: 'invalid_request_error',
      param: null,
      code: 'invalid_api_key',
    },
  },
}

/**
 * Mock style profiles for testing
 */
export const mockStyleProfiles = {
  technical: {
    id: 'profile-technical',
    name: 'Technical Writer',
    personaPrompt: `You are a technical writer who explains concepts clearly and concisely.
Use structured formatting with headings and bullet points.
Provide concrete examples when explaining complex topics.
Keep responses focused and avoid unnecessary jargon.`,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },

  creative: {
    id: 'profile-creative',
    name: 'Creative Storyteller',
    personaPrompt: `You are a creative storyteller who engages readers with vivid narratives.
Use descriptive language and engaging metaphors.
Structure stories with clear beginnings, middles, and ends.`,
    isActive: false,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },

  minimal: {
    id: 'profile-minimal',
    name: 'Minimalist',
    personaPrompt: 'Be brief.',
    isActive: false,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  },
}

/**
 * Mock source documents for testing
 */
export const mockSources = {
  sampleText: {
    id: 'source-1',
    filename: 'sample.txt',
    content: 'This is a sample text file for testing purposes.',
    type: 'text/plain',
    size: 42,
    uploadedAt: new Date('2024-01-01'),
  },

  samplePdf: {
    id: 'source-2',
    filename: 'document.pdf',
    content: 'Extracted content from PDF document.',
    type: 'application/pdf',
    size: 1024,
    uploadedAt: new Date('2024-01-02'),
  },
}

/**
 * Generate a mock chat completion request
 */
export function createMockChatRequest(overrides = {}) {
  return {
    model: 'gpt-4o',
    messages: [{ role: 'user', content: 'Hello, world!' }],
    stream: false,
    ...overrides,
  }
}

/**
 * Generate a mock streaming chat completion request
 */
export function createMockStreamRequest(overrides = {}) {
  return {
    model: 'gpt-4o',
    messages: [{ role: 'user', content: 'Tell me a story.' }],
    stream: true,
    ...overrides,
  }
}

/**
 * Create a mock server response for testing API calls
 */
export function createMockResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Format SSE data for streaming responses
 */
export function formatSSEResponse(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`
}

/**
 * Create a mock ReadableStream for SSE testing
 */
export function createMockSSEResponse(chunks: unknown[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()

  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(formatSSEResponse(chunk)))
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    },
  })
}

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeout = 5000,
  interval = 100
): Promise<void> {
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return
    }
    await new Promise(resolve => setTimeout(resolve, interval))
  }

  throw new Error(`Condition not met within ${timeout}ms`)
}

/**
 * Sleep for a specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
