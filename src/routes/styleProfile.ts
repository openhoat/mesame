import type { FastifyPluginAsync } from 'fastify'
import { generateStyleProfile, getActiveStyleProfile } from '../services/styleProfileService.js'

export const styleProfileRoute: FastifyPluginAsync = async app => {
  // GET /api/style-profile - Get current style profile
  app.get('/api/style-profile', async () => {
    const profile = await getActiveStyleProfile()
    return profile || { personaPrompt: '' }
  })

  // POST /api/style-profile/generate - Generate style profile from all sources
  app.post('/api/style-profile/generate', async () => {
    return await generateStyleProfile()
  })
}
