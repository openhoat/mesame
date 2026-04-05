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

// Helper to create default settings object
const createDefaultSettings = (overrides = {}) => ({
  id: 1,
  language: null,
  llmUrl: null,
  logLevel: null,
  optimizationsEnabled: false,
  slidingWindowSize: 10,
  ...overrides,
})

describe('userSettingsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should create default settings with null language if not exists', async () => {
    vi.mocked(prisma.userSettings.findUnique).mockResolvedValueOnce(null)
    vi.mocked(prisma.userSettings.create).mockResolvedValueOnce(createDefaultSettings())

    const settings = await getUserSettings()

    expect(settings).toBeDefined()
    expect(settings.id).toBe(1)
    expect(settings.language).toBeNull()
    expect(prisma.userSettings.create).toHaveBeenCalledWith({
      data: { id: 1, language: null },
    })
  })

  test('should return existing settings', async () => {
    vi.mocked(prisma.userSettings.findUnique).mockResolvedValueOnce(
      createDefaultSettings({ language: 'fr' })
    )

    const settings = await getUserSettings()

    expect(settings.language).toBe('fr')
    expect(prisma.userSettings.create).not.toHaveBeenCalled()
  })

  test('should update language', async () => {
    vi.mocked(prisma.userSettings.findUnique).mockResolvedValueOnce(
      createDefaultSettings({ language: 'en' })
    )
    vi.mocked(prisma.userSettings.update).mockResolvedValueOnce(
      createDefaultSettings({ language: 'es' })
    )

    const updated = await updateUserSettings({ language: 'es' })

    expect(updated.language).toBe('es')
    expect(prisma.userSettings.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { language: 'es' },
    })
  })

  test('should clear language preference (set to null)', async () => {
    vi.mocked(prisma.userSettings.findUnique).mockResolvedValueOnce(
      createDefaultSettings({ language: 'en' })
    )
    vi.mocked(prisma.userSettings.update).mockResolvedValueOnce(createDefaultSettings())

    const updated = await updateUserSettings({ language: null })

    expect(updated.language).toBeNull()
    expect(prisma.userSettings.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { language: null },
    })
  })

  test('should persist language change', async () => {
    vi.mocked(prisma.userSettings.findUnique).mockResolvedValueOnce(
      createDefaultSettings({ language: 'en' })
    )
    vi.mocked(prisma.userSettings.update).mockResolvedValueOnce(
      createDefaultSettings({ language: 'de' })
    )

    await updateUserSettings({ language: 'de' })

    expect(prisma.userSettings.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { language: 'de' },
    })
  })

  test('should update logLevel', async () => {
    vi.mocked(prisma.userSettings.findUnique).mockResolvedValueOnce(createDefaultSettings())
    vi.mocked(prisma.userSettings.update).mockResolvedValueOnce(
      createDefaultSettings({ logLevel: 'debug' })
    )

    const updated = await updateUserSettings({ logLevel: 'debug' })

    expect(updated.logLevel).toBe('debug')
    expect(prisma.userSettings.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { logLevel: 'debug' },
    })
  })

  test('should update optimizationsEnabled', async () => {
    vi.mocked(prisma.userSettings.findUnique).mockResolvedValueOnce(createDefaultSettings())
    vi.mocked(prisma.userSettings.update).mockResolvedValueOnce(
      createDefaultSettings({ optimizationsEnabled: true })
    )

    const updated = await updateUserSettings({ optimizationsEnabled: true })

    expect(updated.optimizationsEnabled).toBe(true)
    expect(prisma.userSettings.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { optimizationsEnabled: true },
    })
  })

  test('should update slidingWindowSize', async () => {
    vi.mocked(prisma.userSettings.findUnique).mockResolvedValueOnce(createDefaultSettings())
    vi.mocked(prisma.userSettings.update).mockResolvedValueOnce(
      createDefaultSettings({ slidingWindowSize: 20 })
    )

    const updated = await updateUserSettings({ slidingWindowSize: 20 })

    expect(updated.slidingWindowSize).toBe(20)
    expect(prisma.userSettings.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { slidingWindowSize: 20 },
    })
  })
})
