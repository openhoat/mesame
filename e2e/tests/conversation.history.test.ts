/**
 * E2E tests for Conversation History feature
 *
 * These tests verify that the conversation history functionality
 * works correctly end-to-end.
 */

import { expect, test } from '../fixtures.js'

test.describe('Conversation History', () => {
  test.describe('API Endpoints', () => {
    test('should create a conversation via API', async ({ page, port }) => {
      const response = await page
        .context()
        .request.post(`http://localhost:${port}/v1/conversations`, {
          data: {
            title: 'Test Conversation',
            messages: [
              { role: 'user', content: 'Hello' },
              { role: 'assistant', content: 'Hi there!' },
            ],
          },
        })

      expect(response.status()).toBe(201)
      const data = await response.json()
      expect(data.id).toBeTruthy()
      expect(data.title).toBe('Test Conversation')
      expect(data.messages).toHaveLength(2)
    })

    test('should list conversations via API', async ({ page, port }) => {
      const response = await page.context().request.get(`http://localhost:${port}/v1/conversations`)

      expect(response.status()).toBe(200)
      const data = await response.json()
      expect(Array.isArray(data)).toBe(true)
    })

    test('should delete a conversation via API', async ({ page, port }) => {
      // Create a conversation first
      const createResponse = await page
        .context()
        .request.post(`http://localhost:${port}/v1/conversations`, {
          data: {
            title: 'To Delete',
            messages: [{ role: 'user', content: 'test' }],
          },
        })
      const { id } = await createResponse.json()

      // Delete it
      const deleteResponse = await page
        .context()
        .request.delete(`http://localhost:${port}/v1/conversations/${id}`)

      expect(deleteResponse.status()).toBe(204)
    })
  })

  test.describe('UI Interaction', () => {
    test('should display conversation history button in chat header', async ({ page, port }) => {
      await page.goto(`http://localhost:${port}/chat`)
      await page.waitForLoadState('networkidle')

      // Look for history button (has History icon)
      const historyButton = page.locator('button[title="Conversation history"]')
      await expect(historyButton).toBeVisible()
    })

    test('should display new conversation button in chat header', async ({ page, port }) => {
      await page.goto(`http://localhost:${port}/chat`)
      await page.waitForLoadState('networkidle')

      // Look for new conversation button (has Plus icon)
      const newButton = page.locator('button[title="New conversation"]')
      await expect(newButton).toBeVisible()
    })

    test('should open conversation history sidebar', async ({ page, port }) => {
      await page.goto(`http://localhost:${port}/chat`)
      await page.waitForLoadState('networkidle')

      // Click history button
      const historyButton = page.locator('button[title="Conversation history"]')
      await historyButton.click()

      // Verify sidebar appears
      const sidebar = page.locator('text=Conversation History')
      await expect(sidebar).toBeVisible()
    })

    test('should close conversation history sidebar', async ({ page, port }) => {
      await page.goto(`http://localhost:${port}/chat`)
      await page.waitForLoadState('networkidle')

      // Open sidebar
      const historyButton = page.locator('button[title="Conversation history"]')
      await historyButton.click()

      // Wait for sidebar to appear
      const sidebar = page.locator('text=Conversation History')
      await expect(sidebar).toBeVisible()

      // Close sidebar (click backdrop or close button)
      const closeButton = page.locator('button[aria-label="Close conversation history"]').first()
      await closeButton.click()

      // Verify sidebar is gone
      await expect(sidebar).not.toBeVisible()
    })
  })

  test.describe('Conversation Workflow', () => {
    test('should display empty state when no conversations exist', async ({ page, port }) => {
      // Clean up any existing conversations first
      const listResponse = await page
        .context()
        .request.get(`http://localhost:${port}/v1/conversations`)
      const conversations = await listResponse.json()
      for (const conv of conversations) {
        await page.context().request.delete(`http://localhost:${port}/v1/conversations/${conv.id}`)
      }

      await page.goto(`http://localhost:${port}/chat`)
      await page.waitForLoadState('networkidle')

      // Open history sidebar
      const historyButton = page.locator('button[title="Conversation history"]')
      await historyButton.click()

      // Should show empty state
      const emptyState = page.locator('text=No saved conversations yet')
      await expect(emptyState).toBeVisible()
    })

    test('should display conversations in sidebar after creation', async ({ page, port }) => {
      // Create a test conversation via API
      await page.context().request.post(`http://localhost:${port}/v1/conversations`, {
        data: {
          title: 'E2E Test Conversation',
          messages: [
            { role: 'user', content: 'Test message' },
            { role: 'assistant', content: 'Test response' },
          ],
        },
      })

      await page.goto(`http://localhost:${port}/chat`)
      await page.waitForLoadState('networkidle')

      // Open history sidebar
      const historyButton = page.locator('button[title="Conversation history"]')
      await historyButton.click()

      // Should show the conversation
      const conversation = page.locator('text=E2E Test Conversation')
      await expect(conversation).toBeVisible()
    })
  })
})
