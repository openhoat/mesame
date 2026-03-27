/**
 * Sources Page E2E Tests
 */

import { expect, test } from '../fixtures.js'
import { apiRequest } from '../helpers/api.js'

test.describe('Sources Page Tests', () => {
  test.describe('Page Loading', () => {
    test('should load the main page', async ({ page, port }) => {
      await page.goto(`http://localhost:${port}/`)
      await page.waitForLoadState('domcontentloaded')

      const content = await page.content()
      expect(content.length).toBeGreaterThan(0)
    })
  })

  test.describe('Sources API', () => {
    test('should create and fetch sources', async ({ page, port }) => {
      // Create a source
      const createResponse = await apiRequest(page, `http://localhost:${port}/v1/sources`, {
        method: 'POST',
        body: {
          title: 'Test Source',
          content: 'This is a test source content for e2e testing.',
        },
      })

      expect([200, 201]).toContain(createResponse.status)

      const createdBody = createResponse.body as { id?: string; title?: string; content?: string }
      expect(createdBody.id).toBeDefined()
      expect(createdBody.title).toBe('Test Source')

      // Fetch sources list
      const listResponse = await apiRequest(page, `http://localhost:${port}/v1/sources`)
      expect(listResponse.status).toBe(200)
      expect(Array.isArray(listResponse.body)).toBe(true)

      const sources = listResponse.body as Array<{ id: string }>
      expect(sources.length).toBeGreaterThan(0)
    })
  })
})
