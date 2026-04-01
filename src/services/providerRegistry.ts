import { logger } from '../logger.js'
import type { Provider } from '../types/provider.js'
import { getEnabledProviders, getProvider } from './providerService.js'

/**
 * Cached providers with timestamp for cache invalidation
 */
interface CachedProviders {
  providers: Provider[]
  timestamp: number
}

/**
 * Provider registry cache
 */
let cachedProviders: CachedProviders | null = null
const CACHE_TTL = 60000 // 1 minute cache

/**
 * Get all enabled providers (with caching)
 */
export const getAllProviders = async (): Promise<Provider[]> => {
  const now = Date.now()

  // Return cached providers if still valid
  if (cachedProviders && now - cachedProviders.timestamp < CACHE_TTL) {
    return cachedProviders.providers
  }

  // Fetch fresh providers
  const providers = await getEnabledProviders()
  cachedProviders = {
    providers,
    timestamp: now,
  }

  return providers
}

/**
 * Get provider by name (from cache or database)
 */
export const findProvider = async (name: string): Promise<Provider | null> => {
  // Check cache first
  const providers = await getAllProviders()
  const cached = providers.find(p => p.name === name)

  if (cached) {
    return cached
  }

  // Fall back to database (might be disabled)
  return getProvider(name)
}

/**
 * Get provider by type (from enabled providers only)
 * Used when parsing model IDs which use provider type prefix
 */
export const findProviderByType = async (type: string): Promise<Provider | null> => {
  const providers = await getAllProviders()
  return providers.find(p => p.type === type) ?? null
}

/**
 * Get default provider (first enabled provider)
 */
export const getDefaultProvider = async (): Promise<Provider | null> => {
  const providers = await getAllProviders()
  return providers[0] ?? null
}

/**
 * Invalidate provider cache
 */
export const invalidateCache = (): void => {
  cachedProviders = null
  logger.debug('Provider cache invalidated')
}

/**
 * Check if a provider exists and is enabled
 */
export const isProviderEnabled = async (name: string): Promise<boolean> => {
  const providers = await getAllProviders()
  return providers.some(p => p.name === name && p.enabled)
}

/**
 * Get provider names list
 */
export const getProviderNames = async (): Promise<string[]> => {
  const providers = await getAllProviders()
  return providers.map(p => p.name)
}
