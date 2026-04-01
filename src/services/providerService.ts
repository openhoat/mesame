import { prisma } from '../db.js'
import { logger } from '../logger.js'
import type { Provider, ProviderConfig, ProviderResponse, ProviderType } from '../types/provider.js'

/**
 * Cast database provider to Provider type with correct type field
 */
const castProvider = (provider: {
  id: number
  type: string
  name: string
  displayName: string
  baseUrl: string
  apiKey: string | null
  enabled: boolean
  priority: number
  createdAt: Date
  updatedAt: Date
}): Provider => ({
  ...provider,
  type: provider.type as ProviderType,
})

/**
 * Get all providers from database
 */
export const getProviders = async (): Promise<Provider[]> => {
  const providers = await prisma.provider.findMany({
    orderBy: { priority: 'asc' },
  })
  return providers.map(castProvider)
}

/**
 * Get provider by name
 */
export const getProvider = async (name: string): Promise<Provider | null> => {
  const provider = await prisma.provider.findUnique({
    where: { name },
  })
  return provider ? castProvider(provider) : null
}

/**
 * Get all enabled providers
 */
export const getEnabledProviders = async (): Promise<Provider[]> => {
  const providers = await prisma.provider.findMany({
    where: { enabled: true },
    orderBy: { priority: 'asc' },
  })
  return providers.map(castProvider)
}

/**
 * Create or update provider
 */
export const upsertProvider = async (data: ProviderConfig): Promise<Provider> => {
  const provider = await prisma.provider.upsert({
    where: { name: data.name },
    update: {
      type: data.type,
      displayName: data.displayName,
      baseUrl: data.baseUrl,
      apiKey: data.apiKey ?? null,
      enabled: data.enabled,
      priority: data.priority,
    },
    create: {
      type: data.type,
      name: data.name,
      displayName: data.displayName,
      baseUrl: data.baseUrl,
      apiKey: data.apiKey ?? null,
      enabled: data.enabled,
      priority: data.priority,
    },
  })

  logger.info(`Provider ${data.name} ${data.enabled ? 'enabled' : 'disabled'}`)

  return castProvider(provider)
}

/**
 * Delete provider
 */
export const deleteProvider = async (name: string): Promise<Provider | null> => {
  const existingProvider = await getProvider(name)

  if (!existingProvider) {
    return null
  }

  const provider = await prisma.provider.delete({
    where: { name },
  })

  logger.info(`Provider ${name} deleted`)

  return castProvider(provider)
}

/**
 * Convert Provider to ProviderResponse (without sensitive data)
 */
export const toProviderResponse = (provider: Provider, modelsCount?: number): ProviderResponse => ({
  type: provider.type,
  name: provider.name,
  displayName: provider.displayName,
  baseUrl: provider.baseUrl,
  enabled: provider.enabled,
  hasApiKey: !!provider.apiKey,
  modelsCount,
})
