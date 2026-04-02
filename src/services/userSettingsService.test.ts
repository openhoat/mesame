import { beforeEach, describe, expect, test, vi } from 'vitest'
import { prisma } from '../db.js'
import { getUserSettings, updateUserSettings } from './userSettingsService.js'

// Mock the database
vi.mock('../db.js', () => ({
  prisma: {
    userSettings: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}))

describe('userSettingsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should create default settings if not exists', async () => {
    vi.mocked(prisma.userSettings.findUnique).mockResolvedValueOnce(null)
    vi.mocked(prisma.userSettings.create).mockResolvedValueOnce({
      id: 1,
      language: 'en',
    })

    const settings = await getUserSettings()

    expect(settings).toBeDefined()
    expect(settings.id).toBe(1)
    expect(settings.language).toBe('en')
    expect(prisma.userSettings.create).toHaveBeenCalledWith({
      data: { id: 1, language: 'en' },
    })
  })

  test('should return existing settings', async () => {
    vi.mocked(prisma.userSettings.findUnique).mockResolvedValueOnce({
      id: 1,
      language: 'fr',
    })

    const settings = await getUserSettings()

    expect(settings.language).toBe('fr')
    expect(prisma.userSettings.create).not.toHaveBeenCalled()
  })

  test('should update language', async () => {
    vi.mocked(prisma.userSettings.findUnique).mockResolvedValueOnce({
      id: 1,
      language: 'en',
    })
    vi.mocked(prisma.userSettings.update).mockResolvedValueOnce({
      id: 1,
      language: 'es',
    })

    const updated = await updateUserSettings({ language: 'es' })

    expect(updated.language).toBe('es')
    expect(prisma.userSettings.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { language: 'es' },
    })
  })

  test('should persist language change', async () => {
    vi.mocked(prisma.userSettings.findUnique).mockResolvedValueOnce({
      id: 1,
      language: 'en',
    })
    vi.mocked(prisma.userSettings.update).mockResolvedValueOnce({
      id: 1,
      language: 'de',
    })

    await updateUserSettings({ language: 'de' })

    expect(prisma.userSettings.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { language: 'de' },
    })
  })
})
