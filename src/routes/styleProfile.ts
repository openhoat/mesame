import type { FastifyPluginAsync } from 'fastify'
import {
  activateProfile,
  createProfile,
  deleteProfile,
  getAllProfiles,
  getProfileById,
  regenerateProfile,
  updateProfile,
} from '../services/styleProfileService.js'

export const styleProfileRoute: FastifyPluginAsync = async app => {
  // GET /api/style-profile - Get all profiles
  app.get('/api/style-profile', async () => {
    return await getAllProfiles()
  })

  // GET /api/style-profile/:id - Get profile by ID
  app.get<{ Params: { id: string } }>('/api/style-profile/:id', async request => {
    const { id } = request.params
    const profile = await getProfileById(id)

    if (!profile) {
      throw new Error('Profile not found')
    }

    return profile
  })

  // POST /api/style-profile - Create new profile
  app.post<{
    Body: { name: string; sourceIds: string[]; modelId?: string }
  }>('/api/style-profile', async request => {
    const { name, sourceIds, modelId } = request.body
    return await createProfile(name, sourceIds, modelId)
  })

  // PUT /api/style-profile/:id - Update profile
  app.put<{
    Params: { id: string }
    Body: { name?: string; sourceIds?: string[] }
  }>('/api/style-profile/:id', async request => {
    const { id } = request.params
    const { name, sourceIds } = request.body
    return await updateProfile(id, { name, sourceIds })
  })

  // DELETE /api/style-profile/:id - Delete profile
  app.delete<{ Params: { id: string } }>('/api/style-profile/:id', async request => {
    const { id } = request.params
    await deleteProfile(id)
    return { success: true }
  })

  // POST /api/style-profile/:id/activate - Activate profile
  app.post<{ Params: { id: string } }>('/api/style-profile/:id/activate', async request => {
    const { id } = request.params
    return await activateProfile(id)
  })

  // POST /api/style-profile/:id/regenerate - Regenerate profile from sources
  app.post<{
    Params: { id: string }
    Body: { modelId?: string }
  }>('/api/style-profile/:id/regenerate', async request => {
    const { id } = request.params
    const { modelId } = request.body || {}
    return await regenerateProfile(id, modelId)
  })

  // GET /api/style-profile/export - Export all profiles
  app.get('/api/style-profile/export', async () => {
    const profiles = await getAllProfiles()
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      count: profiles.length,
      profiles,
    }
    return exportData
  })
}
