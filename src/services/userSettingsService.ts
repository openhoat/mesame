import { prisma } from '../db.js'

/**
 * Get user settings (creates default if not exists)
 */
export async function getUserSettings() {
  let settings = await prisma.userSettings.findUnique({
    where: { id: 1 },
  })

  if (!settings) {
    // Create default settings (no language preference by default)
    settings = await prisma.userSettings.create({
      data: {
        id: 1,
        language: null,
      },
    })
  }

  return settings
}

/**
 * Update user settings
 */
export async function updateUserSettings(data: {
  language?: string | null
  llmUrl?: string | null
  logLevel?: string | null
  optimizationsEnabled?: boolean
  slidingWindowSize?: number
}) {
  // Ensure the single row exists
  await getUserSettings()

  return prisma.userSettings.update({
    where: { id: 1 },
    data,
  })
}
