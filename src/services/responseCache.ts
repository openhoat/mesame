import { createHash } from 'node:crypto'
import { logger } from '../logger.js'
import type { ChatMessage } from '../types/openai.js'
import type { TokenUsage } from './tokenUsage.js'

interface CachedResponse {
  content: string
  usage: TokenUsage
  timestamp: number
  model: string
}

const cache = new Map<string, CachedResponse>()
const DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes
const MAX_CACHE_SIZE = 200

/**
 * Build a cache key from request parameters.
 */
const buildCacheKey = (
  model: string,
  messages: ChatMessage[],
  temperature?: number,
  maxTokens?: number
): string => {
  const payload = JSON.stringify({ model, messages, temperature, maxTokens })
  return createHash('sha256').update(payload).digest('hex')
}

/**
 * Evict expired entries from the cache.
 */
const evictExpired = (): void => {
  const now = Date.now()
  for (const [key, entry] of cache) {
    if (now - entry.timestamp > DEFAULT_TTL) {
      cache.delete(key)
    }
  }
}

/**
 * Look up a cached response for the given request parameters.
 */
export const getCachedResponse = (
  model: string,
  messages: ChatMessage[],
  temperature?: number,
  maxTokens?: number
): CachedResponse | undefined => {
  evictExpired()
  const key = buildCacheKey(model, messages, temperature, maxTokens)
  const entry = cache.get(key)
  if (entry && Date.now() - entry.timestamp < DEFAULT_TTL) {
    logger.debug(`Response cache hit for model ${model}`)
    return entry
  }
  return undefined
}

/**
 * Store a response in the cache.
 */
export const setCachedResponse = (
  model: string,
  messages: ChatMessage[],
  content: string,
  usage: TokenUsage,
  temperature?: number,
  maxTokens?: number
): void => {
  // Enforce max cache size with LRU-style eviction
  if (cache.size >= MAX_CACHE_SIZE) {
    evictExpired()
    // If still over limit, remove oldest entry
    if (cache.size >= MAX_CACHE_SIZE) {
      const oldestKey = cache.keys().next().value
      if (oldestKey) {
        cache.delete(oldestKey)
      }
    }
  }

  const key = buildCacheKey(model, messages, temperature, maxTokens)
  cache.set(key, {
    content,
    usage,
    model,
    timestamp: Date.now(),
  })
  logger.debug(`Response cached for model ${model}`)
}

/**
 * Clear the entire response cache.
 */
export const clearResponseCache = (): void => {
  cache.clear()
}

/**
 * Get current cache stats.
 */
export const getResponseCacheStats = (): { size: number; maxSize: number } => ({
  size: cache.size,
  maxSize: MAX_CACHE_SIZE,
})
