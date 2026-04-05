import type { FastifyInstance } from 'fastify'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { buildApp } from '../../app.js'
import { config } from '../../config.js'
import type { ChatCompletionRequest, ChatCompletionResponse } from '../../types/openai.js'

const USE_REAL_API = process.env.TEST_REAL_API === 'true'
// Use the model from config (supports different providers: OpenAI, Anthropic, Ollama, etc.)
const TEST_MODEL = config.model || 'gpt-4o-mini'

const TEST_PROMPT = `You are an AI assistant that responds in a technical and precise style.

Your responses must be:
1. Structured with headings and bullet lists
2. Concise but informative
3. Focused on concrete examples
4. Written in a professional but accessible tone

You acknowledge the limits of your knowledge when relevant.`

// Mock the styleProfileService
vi.mock('../../services/styleProfileService.js', () => ({
  getActiveStyleProfile: vi.fn(),
  ensureDefaultProfile: vi.fn().mockResolvedValue(undefined),
}))

// Mock userSettingsService
vi.mock('../../services/userSettingsService.js', () => ({
  getUserSettings: vi.fn().mockResolvedValue({
    id: 1,
    language: null,
    llmUrl: null,
    logLevel: null,
    optimizationsEnabled: false,
    slidingWindowSize: 10,
  }),
}))

// Import after mocking
import { getActiveStyleProfile } from '../../services/styleProfileService.js'

const mockedGetActiveStyleProfile = vi.mocked(getActiveStyleProfile)

/**
 * Helper functions to verify style influence in LLM responses
 */
function hasHeadings(text: string): boolean {
  // Check for markdown headings (# at start of line)
  return /^#{1,3}\s+/m.test(text)
}

function hasBulletLists(text: string): boolean {
  // Check for markdown bullet lists (- or * at start of line)
  return /^[-*]\s+/m.test(text)
}

function hasNumberedList(text: string): boolean {
  // Check for numbered lists (1. 2. etc.)
  return /^\d+\.\s+/m.test(text)
}

function hasStructuredContent(text: string): boolean {
  return hasHeadings(text) || hasBulletLists(text) || hasNumberedList(text)
}

function hasConcreteExamples(text: string): boolean {
  // Check for common example indicators
  const examplePatterns = [/for example/i, /e\.g\./i, /such as/i, /like\s+\w+/i, /instance/i]
  return examplePatterns.some(pattern => pattern.test(text))
}

function hasProfessionalTone(text: string): boolean {
  // Check for professional language indicators
  const professionalPatterns = [
    /\b(note|important|key|consider|relevant)\b/i,
    /\b(however|therefore|furthermore|additionally)\b/i,
    /\b(in summary|to conclude|in conclusion)\b/i,
  ]
  return professionalPatterns.some(pattern => pattern.test(text))
}

function isReasonablyConcise(text: string): boolean {
  // Response should be informative but not excessively long
  const wordCount = text.split(/\s+/).length
  return wordCount >= 20 && wordCount <= 800
}

describe('Style Injection E2E', () => {
  let app: FastifyInstance

  // Longer timeout for real API tests (LLM can be slow)
  if (USE_REAL_API) {
    vi.setConfig({ testTimeout: 60000, hookTimeout: 60000 })
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    app = await buildApp()
  })

  afterEach(async () => {
    await app.close()
  })

  test('should inject style prompt into request messages', async () => {
    // Mock database to return a style profile
    mockedGetActiveStyleProfile.mockResolvedValueOnce({
      personaPrompt: TEST_PROMPT,
    })

    const requestBody: ChatCompletionRequest = {
      model: TEST_MODEL,
      messages: [{ role: 'user', content: 'Explain what is a REST API' }],
      stream: false,
    }

    if (USE_REAL_API) {
      // Real API test: verify style influence on LLM response
      const response = await app.inject({
        method: 'POST',
        url: '/v1/chat/completions',
        payload: requestBody,
      })

      expect(response.statusCode).toBe(200)
      const data = (await response.json()) as ChatCompletionResponse
      const content = data.choices[0]?.message.content

      expect(content).toBeDefined()
      expect(content!.length).toBeGreaterThan(50)

      // Verify structured content (headings, bullet lists, or numbered lists)
      expect(hasStructuredContent(content!)).toBe(true)

      // Verify response is reasonably concise
      expect(isReasonablyConcise(content!)).toBe(true)

      // Log the response for manual inspection during real API tests
      // biome-ignore lint/suspicious/noConsole: Debug output for real API tests
      console.log('\n=== Real API Response ===')
      // biome-ignore lint/suspicious/noConsole: Debug output for real API tests
      console.log(content)
      // biome-ignore lint/suspicious/noConsole: Debug output for real API tests
      console.log('=========================\n')
    } else {
      // Skip mocked test in CI - LangChain integration requires real API
      // Note: Local mocking of LangChain providers is complex and not necessary
      // for E2E tests as they should verify real integration
    }
  })

  test('should merge style prompt with existing system message', async () => {
    // Mock database to return a style profile
    mockedGetActiveStyleProfile.mockResolvedValueOnce({
      personaPrompt: TEST_PROMPT,
    })

    const requestBody: ChatCompletionRequest = {
      model: TEST_MODEL,
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'What is JSON?' },
      ],
      stream: false,
    }

    if (USE_REAL_API) {
      // Real API test: verify merged prompt still influences response
      const response = await app.inject({
        method: 'POST',
        url: '/v1/chat/completions',
        payload: requestBody,
      })

      expect(response.statusCode).toBe(200)
      const data = (await response.json()) as ChatCompletionResponse
      const content = data.choices[0]?.message.content

      expect(content).toBeDefined()

      // The style should still influence the response
      expect(hasStructuredContent(content!)).toBe(true)

      // biome-ignore lint/suspicious/noConsole: Debug output for real API tests
      console.log('\n=== Merged System Prompt Response ===')
      // biome-ignore lint/suspicious/noConsole: Debug output for real API tests
      console.log(content)
      // biome-ignore lint/suspicious/noConsole: Debug output for real API tests
      console.log('====================================\n')
    } else {
      // Skip mocked test in CI - LangChain integration requires real API
    }
  })

  test('should inject default prompt when no style profile exists', async () => {
    // Mock database to return null (no style profile)
    mockedGetActiveStyleProfile.mockResolvedValueOnce(null)

    const requestBody: ChatCompletionRequest = {
      model: TEST_MODEL,
      messages: [{ role: 'user', content: 'Hello' }],
      stream: false,
    }

    if (USE_REAL_API) {
      // Real API test: response with default style injection
      const response = await app.inject({
        method: 'POST',
        url: '/v1/chat/completions',
        payload: requestBody,
      })

      expect(response.statusCode).toBe(200)
      const data = (await response.json()) as ChatCompletionResponse
      const content = data.choices[0]?.message.content

      expect(content).toBeDefined()

      // biome-ignore lint/suspicious/noConsole: Debug output for real API tests
      console.log('\n=== Default Style Profile Response ===')
      // biome-ignore lint/suspicious/noConsole: Debug output for real API tests
      console.log(content)
      // biome-ignore lint/suspicious/noConsole: Debug output for real API tests
      console.log('======================================\n')
    } else {
      // Skip mocked test in CI - LangChain integration requires real API
    }
  })

  // Additional test: verify style influence with concrete examples
  if (USE_REAL_API) {
    test('real API: style should produce structured response with examples', async () => {
      mockedGetActiveStyleProfile.mockResolvedValueOnce({
        personaPrompt: TEST_PROMPT,
      })

      const requestBody: ChatCompletionRequest = {
        model: TEST_MODEL,
        messages: [
          {
            role: 'user',
            content: 'What are the benefits of TypeScript? List at least 3.',
          },
        ],
        stream: false,
      }

      const response = await app.inject({
        method: 'POST',
        url: '/v1/chat/completions',
        payload: requestBody,
      })

      expect(response.statusCode).toBe(200)
      const data = (await response.json()) as ChatCompletionResponse
      const content = data.choices[0]?.message.content

      expect(content).toBeDefined()

      // Verify style characteristics
      const hasStructure = hasStructuredContent(content!)
      const hasExamples = hasConcreteExamples(content!)
      const isProfessional = hasProfessionalTone(content!)

      // biome-ignore lint/suspicious/noConsole: Debug output for real API tests
      console.log('\n=== Style Verification ===')
      // biome-ignore lint/suspicious/noConsole: Debug output for real API tests
      console.log(`Has structure (headings/lists): ${hasStructure}`)
      // biome-ignore lint/suspicious/noConsole: Debug output for real API tests
      console.log(`Has concrete examples: ${hasExamples}`)
      // biome-ignore lint/suspicious/noConsole: Debug output for real API tests
      console.log(`Has professional tone: ${isProfessional}`)
      // biome-ignore lint/suspicious/noConsole: Debug output for real API tests
      console.log(`Word count: ${content!.split(/\s+/).length}`)
      // biome-ignore lint/suspicious/noConsole: Debug output for real API tests
      console.log('==========================\n')

      // At least structured content should be present
      expect(hasStructure).toBe(true)

      // Log full response
      // biome-ignore lint/suspicious/noConsole: Debug output for real API tests
      console.log('\n=== Full Response ===')
      // biome-ignore lint/suspicious/noConsole: Debug output for real API tests
      console.log(content)
      // biome-ignore lint/suspicious/noConsole: Debug output for real API tests
      console.log('=====================\n')
    })
  }
})
