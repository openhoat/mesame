import { prisma } from '../db.js'
import { generatePersonaPrompt } from './personaPromptGenerator.js'
import { getAllSources } from './sourceService.js'
import { analyzeStyle } from './styleAnalyzer.js'
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

export async function saveStyleProfile(
  personaPrompt: string,
  metrics: string
): Promise<StyleProfile> {
  const profile = await prisma.styleProfile.upsert({
    where: { id: 1 },
    create: { personaPrompt, metrics },
    update: { personaPrompt, metrics },
  })

  return {
    personaPrompt: profile.personaPrompt,
  }
}

export async function generateStyleProfile(): Promise<StyleProfile> {
  // Step 1: Retrieve all sources
  const sources = await getAllSources()

  if (sources.length === 0) {
    throw new Error('No sources available for style analysis')
  }

  // Step 2: Combine all source content
  const combinedContent = sources.map(source => source.content).join('\n\n')

  // Step 3: Analyze style
  const analysis = analyzeStyle(combinedContent)

  // Step 4: Generate persona prompt (style only, no language)
  const personaPrompt = generatePersonaPrompt(analysis)

  // Step 5: Save style profile
  const metricsJson = JSON.stringify(analysis.metrics)
  return saveStyleProfile(personaPrompt, metricsJson)
}
