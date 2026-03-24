import { expect } from '@playwright/test'
import { test } from '../fixtures.js'

test.describe('Chat Streaming Tests', () => {
  test('should receive and display streaming chat response', async ({ page }) => {
    // Wait for chat interface to load
    await page.waitForSelector('textarea', { timeout: 10000 })

    // Type a message
    const textarea = page.locator('textarea')
    await textarea.fill('Say just: Hello')

    // Send the message (Enter key)
    await textarea.press('Enter')

    // Wait for user message to appear
    await expect(page.locator('text=Say just: Hello')).toBeVisible({ timeout: 5000 })

    // Wait for assistant response to start appearing
    await page.waitForSelector('[data-role="assistant"]', { timeout: 10000 })

    // Wait for streaming to complete (shorter timeout since mock is fast)
    await page.waitForTimeout(2000)

    // Check that assistant message has content
    const assistantMessage = page.locator('[data-role="assistant"]').first()
    const content = await assistantMessage.textContent()

    expect(content).toBeTruthy()
    expect(content!.length).toBeGreaterThan(0)
  })

  test('should handle multiple messages in sequence', async ({ page }) => {
    await page.waitForSelector('textarea', { timeout: 10000 })

    // Send first message
    const textarea = page.locator('textarea')
    await textarea.fill('First message')
    await textarea.press('Enter')

    // Wait for first response and streaming to complete
    await page.waitForSelector('[data-role="assistant"]', { timeout: 10000 })
    await page.waitForFunction(
      () => {
        const sendBtn = document.querySelector('#send-btn')
        return sendBtn && !sendBtn.hasAttribute('disabled')
      },
      { timeout: 15000 }
    )

    // Send second message
    await textarea.fill('Second message')
    await textarea.press('Enter')

    // Should have 2 assistant messages
    const assistantMessages = page.locator('[data-role="assistant"]')
    await expect(assistantMessages).toHaveCount(2, { timeout: 15000 })
  })
})
