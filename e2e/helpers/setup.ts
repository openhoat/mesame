/**
 * Setup and cleanup helpers for E2E tests
 *
 * Provides utilities to prepare test environment, create test data,
 * and clean up after tests to ensure isolation between test runs.
 */

import type { Page } from '@playwright/test'
import type { TestProfile, TestSource } from '../fixtures/test-data.js'
import { apiRequest, uploadSource } from './api.js'

export interface SetupProfileResult {
  profileId?: string
  profileName: string
  sourceId?: string
  success: boolean
  error?: string
}

/**
 * Upload a test source document
 */
export async function uploadTestSource(
  page: Page,
  port: number,
  source: TestSource
): Promise<{ success: boolean; sourceId?: string; error?: string }> {
  try {
    const response = await uploadSource(page, port, source.filename, source.content)

    if (response.status === 200 || response.status === 201) {
      const body = response.body as { id?: string; source?: { id?: string } }
      return {
        success: true,
        sourceId: body.id || body.source?.id,
      }
    }

    return {
      success: false,
      error: `Upload failed with status ${response.status}`,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Create a style profile from uploaded sources
 *
 * This helper uploads a source document and creates a style profile
 * based on the analyzed content.
 */
export async function setupTestProfile(
  page: Page,
  port: number,
  profile: TestProfile,
  source: TestSource
): Promise<SetupProfileResult> {
  try {
    // Step 1: Upload source document
    const uploadResult = await uploadTestSource(page, port, source)

    if (!uploadResult.success) {
      return {
        profileName: profile.name,
        success: false,
        error: `Failed to upload source: ${uploadResult.error}`,
      }
    }

    // Step 2: Wait a bit for analysis to complete
    // In a real scenario, we'd poll an analysis status endpoint
    await page.waitForTimeout(1000)

    // Step 3: Create style profile
    const response = await apiRequest(page, `http://localhost:${port}/v1/style-profile`, {
      method: 'POST',
      body: {
        name: profile.name,
        personaPrompt: profile.personaPrompt,
      },
    })

    if (response.status === 200 || response.status === 201) {
      const body = response.body as { id?: string; profile?: { id?: string } }
      return {
        profileId: body.id || body.profile?.id,
        profileName: profile.name,
        sourceId: uploadResult.sourceId,
        success: true,
      }
    }

    return {
      profileName: profile.name,
      sourceId: uploadResult.sourceId,
      success: false,
      error: `Failed to create profile: HTTP ${response.status}`,
    }
  } catch (error) {
    return {
      profileName: profile.name,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Delete all sources (cleanup)
 */
export async function cleanupSources(
  page: Page,
  port: number
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get all sources
    const response = await apiRequest(page, `http://localhost:${port}/v1/sources`)

    if (response.status !== 200) {
      return {
        success: false,
        error: `Failed to fetch sources: HTTP ${response.status}`,
      }
    }

    const sources = response.body as Array<{ id: string }>

    // Delete each source
    for (const source of sources) {
      await apiRequest(page, `http://localhost:${port}/v1/sources/${source.id}`, {
        method: 'DELETE',
      })
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Delete all style profiles (cleanup)
 */
export async function cleanupProfiles(
  page: Page,
  port: number
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get all profiles
    const response = await apiRequest(page, `http://localhost:${port}/v1/style-profile`)

    if (response.status === 404) {
      // No profiles to clean up
      return { success: true }
    }

    if (response.status !== 200) {
      return {
        success: false,
        error: `Failed to fetch profiles: HTTP ${response.status}`,
      }
    }

    const data = response.body
    const profiles = Array.isArray(data) ? data : data && typeof data === 'object' ? [data] : []

    // Delete each profile
    for (const profile of profiles) {
      const profileData = profile as { id?: string }
      if (profileData.id) {
        await apiRequest(page, `http://localhost:${port}/v1/style-profile/${profileData.id}`, {
          method: 'DELETE',
        })
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Complete cleanup - remove all test data
 */
export async function cleanupTestData(
  page: Page,
  port: number
): Promise<{ success: boolean; errors: string[] }> {
  const errors: string[] = []

  // Cleanup profiles first (they may reference sources)
  const profileCleanup = await cleanupProfiles(page, port)
  if (!profileCleanup.success && profileCleanup.error) {
    errors.push(`Profile cleanup: ${profileCleanup.error}`)
  }

  // Then cleanup sources
  const sourceCleanup = await cleanupSources(page, port)
  if (!sourceCleanup.success && sourceCleanup.error) {
    errors.push(`Source cleanup: ${sourceCleanup.error}`)
  }

  return {
    success: errors.length === 0,
    errors,
  }
}

/**
 * Wait for a profile to be created and available
 */
export async function waitForProfile(
  page: Page,
  port: number,
  profileName: string,
  timeoutMs = 10000
): Promise<boolean> {
  const startTime = Date.now()

  while (Date.now() - startTime < timeoutMs) {
    const response = await apiRequest(page, `http://localhost:${port}/v1/style-profile`)

    if (response.status === 200) {
      const data = response.body
      const profiles = Array.isArray(data) ? data : data && typeof data === 'object' ? [data] : []

      const found = profiles.some(p => {
        const profile = p as { name?: string }
        return profile.name === profileName
      })

      if (found) {
        return true
      }
    }

    await page.waitForTimeout(500)
  }

  return false
}

/**
 * Navigate to a specific section in the dashboard
 */
export async function navigateToSection(
  page: Page,
  section: 'dashboard' | 'chat' | 'config' | 'sources' | 'profiles' | 'logs'
): Promise<void> {
  const sectionMap: Record<string, string> = {
    dashboard: 'Dashboard',
    chat: 'Chat',
    config: 'Server Config',
    sources: 'Sources',
    profiles: 'Style Profiles',
    logs: 'Request Logs',
  }

  const buttonName = sectionMap[section]
  if (!buttonName) {
    throw new Error(`Unknown section: ${section}`)
  }

  // Click the navigation button
  const button = page.getByRole('button', { name: buttonName })
  await button.click()

  // Wait for navigation to complete
  await page.waitForLoadState('networkidle')
}

/**
 * Check if a style pattern is present in text
 */
export function matchesStylePattern(text: string, patterns: readonly RegExp[]): boolean {
  return patterns.some(pattern => pattern.test(text))
}

/**
 * Check if text avoids certain patterns
 */
export function avoidsStylePattern(text: string, patterns: readonly RegExp[]): boolean {
  return !patterns.some(pattern => pattern.test(text))
}
