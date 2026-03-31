import { beforeEach, describe, expect, test, vi } from 'vitest'
import { getLLMProvider } from './llmProvider.js'
import { refineStyleAnalysis } from './styleRefiner.js'

// Mock LLM Provider
vi.mock('./llmProvider.js', () => ({
  getLLMProvider: vi.fn(),
  convertToLangChainMessages: vi.fn(msgs => msgs),
}))

describe('styleRefiner', () => {
  const mockInvoke = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(getLLMProvider as any).mockReturnValue({
      invoke: mockInvoke,
    })
  })

  test('should filter expressions and transitions using IA', async () => {
    const analysis = {
      tfidf: [],
      bigrams: [
        { gram: 'véritablement complexe', count: 5 },
        { gram: 'secret bitmask', count: 3 },
      ],
      trigrams: [
        { gram: 'extrêmement simple à', count: 4 },
        { gram: 'cluster kubernetes local', count: 2 },
      ],
      transitions: [
        { gram: 'cependant', count: 10 },
        { gram: 'content type', count: 5 },
      ],
      metrics: {} as any,
    }

    const mockPersona = 'You lean towards truly complex topics while keeping things simple.'
    mockInvoke.mockResolvedValue({
      content: mockPersona,
    })

    const refinedPrompt = await refineStyleAnalysis(analysis as any)

    expect(typeof refinedPrompt).toBe('string')
    expect(refinedPrompt).toBe(mockPersona)
  })

  test('should fallback to a basic prompt if IA fails', async () => {
    const analysis = {
      tfidf: [],
      bigrams: [{ gram: 'test', count: 1 }],
      trigrams: [],
      transitions: [],
      metrics: {} as any,
    }

    mockInvoke.mockRejectedValue(new Error('AI failed'))

    const refinedPrompt = await refineStyleAnalysis(analysis as any)
    expect(refinedPrompt).toContain('AI assistant')
  })
})
