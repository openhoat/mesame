import { prisma } from '../db.js'
import type { StyleProfile } from './styleInjector.js'

export async function getActiveStyleProfile(): Promise<StyleProfile | null> {
  const profile = await prisma.styleProfile.findUnique({
    where: { id: 1 },
  })

  if (!profile) return null

  return {
    personaPrompt: profile.personaPrompt,
  }
}
