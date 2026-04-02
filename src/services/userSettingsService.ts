import { prisma } from '../db.js'

/**
 * Get user settings (creates default if not exists)
 */
export async function getUserSettings() {
  let settings = await prisma.userSettings.findUnique({
    where: { id: 1 },
  })

  if (!settings) {
    // Create default settings
    settings = await prisma.userSettings.create({
      data: {
        id: 1,
        language: 'en',
      },
    })
  }

  return settings
}

/**
 * Update user settings
 */
export async function updateUserSettings(data: { language?: string }) {
  // Ensure the single row exists
  await getUserSettings()

  return prisma.userSettings.update({
    where: { id: 1 },
    data,
  })
}
