import { prisma } from '../db.js'
import { analyzeStyle } from './styleAnalyzer.js'
import type { StyleProfile } from './styleInjector.js'
import { refineStyleAnalysis } from './styleRefiner.js'

export interface ProfileWithSources {
  id: string
  name: string
  personaPrompt: string
  metrics: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  sources: Array<{ id: string; title: string }>
}

// Get active profile (for style injection)
export const getActiveStyleProfile = async (): Promise<StyleProfile | null> => {
  const profile = await prisma.styleProfile.findFirst({
    where: { isActive: true },
  })

  if (!profile) return null

  return {
    personaPrompt: profile.personaPrompt,
  }
}

// Get all profiles
export const getAllProfiles = async (): Promise<ProfileWithSources[]> => {
  const profiles = await prisma.styleProfile.findMany({
    include: {
      sources: {
        include: {
          source: {
            select: { id: true, title: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return profiles.map(profile => ({
    id: profile.id,
    name: profile.name,
    personaPrompt: profile.personaPrompt,
    metrics: profile.metrics,
    isActive: profile.isActive,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    sources: profile.sources.map(ps => ps.source),
  }))
}

// Get profile by ID
export const getProfileById = async (id: string): Promise<ProfileWithSources | null> => {
  const profile = await prisma.styleProfile.findUnique({
    where: { id },
    include: {
      sources: {
        include: {
          source: {
            select: { id: true, title: true },
          },
        },
      },
    },
  })

  if (!profile) return null

  return {
    id: profile.id,
    name: profile.name,
    personaPrompt: profile.personaPrompt,
    metrics: profile.metrics,
    isActive: profile.isActive,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    sources: profile.sources.map(ps => ps.source),
  }
}

// Create new profile
export const createProfile = async (
  name: string,
  sourceIds: string[]
): Promise<ProfileWithSources> => {
  if (sourceIds.length === 0) {
    throw new Error('At least one source is required to create a profile')
  }

  // Fetch sources for analysis
  const sources = await prisma.source.findMany({
    where: { id: { in: sourceIds } },
  })

  if (sources.length === 0) {
    throw new Error('No valid sources found')
  }

  // Combine source content and analyze
  const combinedContent = sources.map(s => s.content).join('\n\n')
  const analysis = analyzeStyle(combinedContent)
  
  // Generate narrative persona prompt via IA
  const personaPrompt = await refineStyleAnalysis(analysis)
  const metricsJson = JSON.stringify(analysis.metrics)

  // Create profile with sources
  const profile = await prisma.styleProfile.create({
    data: {
      name,
      personaPrompt,
      metrics: metricsJson,
      sources: {
        create: sourceIds.map(sourceId => ({ sourceId })),
      },
    },
    include: {
      sources: {
        include: {
          source: {
            select: { id: true, title: true },
          },
        },
      },
    },
  })

  return {
    id: profile.id,
    name: profile.name,
    personaPrompt: profile.personaPrompt,
    metrics: profile.metrics,
    isActive: profile.isActive,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    sources: profile.sources.map(ps => ps.source),
  }
}

// Update profile (name and/or sources)
export const updateProfile = async (
  id: string,
  data: { name?: string; sourceIds?: string[] }
): Promise<ProfileWithSources> => {
  const updateData: { name?: string; updatedAt: Date } = { updatedAt: new Date() }

  if (data.name) {
    updateData.name = data.name
  }

  await prisma.styleProfile.update({
    where: { id },
    data: updateData,
  })

  // Update sources if provided
  if (data.sourceIds) {
    // Remove old associations
    await prisma.profileSource.deleteMany({
      where: { profileId: id },
    })

    // Create new associations
    await prisma.profileSource.createMany({
      data: data.sourceIds.map(sourceId => ({ profileId: id, sourceId })),
    })
  }

  // Fetch updated profile
  const updated = await getProfileById(id)
  if (!updated) {
    throw new Error('Profile not found after update')
  }
  return updated
}

// Delete profile
export const deleteProfile = async (id: string): Promise<void> => {
  await prisma.styleProfile.delete({
    where: { id },
  })
}

// Activate profile (deactivate others)
export const activateProfile = async (id: string): Promise<ProfileWithSources> => {
  // Deactivate all profiles
  await prisma.styleProfile.updateMany({
    data: { isActive: false },
  })

  // Activate target profile
  const profile = await prisma.styleProfile.update({
    where: { id },
    data: { isActive: true },
    include: {
      sources: {
        include: {
          source: {
            select: { id: true, title: true },
          },
        },
      },
    },
  })

  return {
    id: profile.id,
    name: profile.name,
    personaPrompt: profile.personaPrompt,
    metrics: profile.metrics,
    isActive: profile.isActive,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    sources: profile.sources.map(ps => ps.source),
  }
}

// Regenerate profile from its sources
export const regenerateProfile = async (id: string): Promise<ProfileWithSources> => {
  const profile = await prisma.styleProfile.findUnique({
    where: { id },
    include: {
      sources: {
        include: {
          source: true,
        },
      },
    },
  })

  if (!profile) {
    throw new Error('Profile not found')
  }

  if (profile.sources.length === 0) {
    throw new Error('Profile has no sources to regenerate from')
  }

  // Combine source content and analyze
  const combinedContent = profile.sources.map(ps => ps.source.content).join('\n\n')
  const analysis = analyzeStyle(combinedContent)
  
  // Generate narrative persona prompt via IA
  const personaPrompt = await refineStyleAnalysis(analysis)
  const metricsJson = JSON.stringify(analysis.metrics)

  // Update profile
  const updated = await prisma.styleProfile.update({
    where: { id },
    data: {
      personaPrompt,
      metrics: metricsJson,
    },
    include: {
      sources: {
        include: {
          source: {
            select: { id: true, title: true },
          },
        },
      },
    },
  })

  return {
    id: updated.id,
    name: updated.name,
    personaPrompt: updated.personaPrompt,
    metrics: updated.metrics,
    isActive: updated.isActive,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
    sources: updated.sources.map(ps => ps.source),
  }
}
