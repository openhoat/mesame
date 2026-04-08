import type { AIMessage, AIMessageChunk } from '@langchain/core/messages'

export interface TokenUsage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  cache_creation_input_tokens?: number
  cache_read_input_tokens?: number
}

interface AnthropicUsage {
  input_tokens?: number
  output_tokens?: number
  cache_creation_input_tokens?: number
  cache_read_input_tokens?: number
}

interface OpenAITokenUsage {
  promptTokens?: number
  completionTokens?: number
  totalTokens?: number
}

const isAnthropicUsage = (value: unknown): value is AnthropicUsage =>
  typeof value === 'object' && value !== null && 'input_tokens' in value

const isOpenAITokenUsage = (value: unknown): value is OpenAITokenUsage =>
  typeof value === 'object' && value !== null && 'promptTokens' in value

/**
 * Extract and normalize token usage from a LangChain AIMessage response.
 * Handles differences between providers (OpenAI, Anthropic, etc.).
 */
export const extractTokenUsage = (response: AIMessage): TokenUsage => {
  // LangChain standardized usage_metadata (preferred)
  const usageMeta = response.usage_metadata
  if (usageMeta) {
    return {
      prompt_tokens: usageMeta.input_tokens ?? 0,
      completion_tokens: usageMeta.output_tokens ?? 0,
      total_tokens: usageMeta.total_tokens ?? 0,
    }
  }

  const metadata = response.response_metadata

  // Anthropic format: response_metadata.usage
  if (isAnthropicUsage(metadata?.usage)) {
    const usage = metadata.usage
    return {
      prompt_tokens: usage.input_tokens ?? 0,
      completion_tokens: usage.output_tokens ?? 0,
      total_tokens: (usage.input_tokens ?? 0) + (usage.output_tokens ?? 0),
      cache_creation_input_tokens: usage.cache_creation_input_tokens,
      cache_read_input_tokens: usage.cache_read_input_tokens,
    }
  }

  // OpenAI format: response_metadata.tokenUsage
  if (isOpenAITokenUsage(metadata?.tokenUsage)) {
    const tokenUsage = metadata.tokenUsage
    return {
      prompt_tokens: tokenUsage.promptTokens ?? 0,
      completion_tokens: tokenUsage.completionTokens ?? 0,
      total_tokens: tokenUsage.totalTokens ?? 0,
    }
  }

  return { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
}

/**
 * Extract token usage from a streaming AIMessageChunk (last chunk often has usage).
 */
export const extractStreamingTokenUsage = (chunk: AIMessageChunk): TokenUsage | undefined => {
  const usageMeta = chunk.usage_metadata
  if (usageMeta && (usageMeta.input_tokens || usageMeta.output_tokens)) {
    return {
      prompt_tokens: usageMeta.input_tokens ?? 0,
      completion_tokens: usageMeta.output_tokens ?? 0,
      total_tokens: usageMeta.total_tokens ?? 0,
    }
  }
  return undefined
}
