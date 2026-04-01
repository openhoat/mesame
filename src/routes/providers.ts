import type { FastifyInstance } from 'fastify'
import { listProviderModels } from '../services/modelDiscovery.js'
import { invalidateCache } from '../services/providerRegistry.js'
import {
  deleteProvider,
  getProviders,
  toProviderResponse,
  upsertProvider,
} from '../services/providerService.js'
import { PROVIDER_TYPES, type ProviderConfig, type ProviderType } from '../types/provider.js'

/**
 * Provider management routes
 */
export async function providerRoutes(app: FastifyInstance): Promise<void> {
  // GET /api/providers - List all providers
  app.get('/api/providers', async () => {
    const providers = await getProviders()

    // Get model count for each provider
    const providersWithCounts = await Promise.all(
      providers.map(async provider => {
        try {
          const models = await listProviderModels(provider)
          return toProviderResponse(provider, models.length)
        } catch {
          return toProviderResponse(provider, 0)
        }
      })
    )

    return { providers: providersWithCounts }
  })

  // POST /api/providers - Create or update provider
  app.post<{ Body: ProviderConfig }>('/api/providers', async (request, reply) => {
    const data = request.body

    // Validate required fields
    if (!data.type || !data.name || !data.baseUrl) {
      return reply.status(400).send({
        error: 'Missing required fields: type, name, baseUrl',
      })
    }

    // Validate provider type
    const validTypes = Object.keys(PROVIDER_TYPES) as ProviderType[]
    if (!validTypes.includes(data.type)) {
      return reply.status(400).send({
        error: `Invalid provider type. Valid types: ${validTypes.join(', ')}`,
      })
    }

    try {
      const provider = await upsertProvider(data)

      // Invalidate cache so new configuration is picked up
      invalidateCache()

      return toProviderResponse(provider)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return reply.status(500).send({
        error: `Failed to save provider: ${errorMessage}`,
      })
    }
  })

  // DELETE /api/providers/:name - Delete provider
  app.delete<{ Params: { name: string } }>('/api/providers/:name', async (request, reply) => {
    const { name } = request.params

    const provider = await deleteProvider(name)

    if (!provider) {
      return reply.status(404).send({
        error: `Provider '${name}' not found`,
      })
    }

    // Invalidate cache
    invalidateCache()

    return toProviderResponse(provider)
  })

  // GET /api/providers/:name/models - List models for a specific provider
  app.get<{ Params: { name: string } }>('/api/providers/:name/models', async (request, reply) => {
    const { name } = request.params

    const providers = await getProviders()
    const provider = providers.find(p => p.name === name)

    if (!provider) {
      return reply.status(404).send({
        error: `Provider '${name}' not found`,
      })
    }

    if (!provider.enabled) {
      return reply.status(400).send({
        error: `Provider '${name}' is not enabled`,
      })
    }

    try {
      const models = await listProviderModels(provider)
      return {
        provider: name,
        models,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return reply.status(500).send({
        error: `Failed to fetch models: ${errorMessage}`,
      })
    }
  })
}
