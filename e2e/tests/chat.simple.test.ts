import { expect } from '@playwright/test'
import { test } from '../fixtures.js'

test.describe('Simple Chat Test', () => {
  test('should send "hello" and receive a response', async ({ page }) => {
    // Wait for chat interface to load
    await page.waitForSelector('textarea', { timeout: 10000 })

    // Type "hello"
    const textarea = page.locator('textarea')
    await textarea.fill('hello')

    // Send the message (Enter key)
    await textarea.press('Enter')

    // Wait for user message to appear
    await expect(page.locator('text=hello')).toBeVisible({ timeout: 5000 })

    // Wait for assistant response to start appearing
    await page.waitForSelector('[data-role="assistant"]', { timeout: 15000 })

    // Wait for streaming to complete by checking send button is enabled again
    await page.waitForFunction(
      () => {
        const sendBtn = document.querySelector('#send-btn')
        return sendBtn && !sendBtn.hasAttribute('disabled')
      },
      { timeout: 15000 }
    )

    // Check that assistant message has content
    const assistantMessage = page.locator('[data-role="assistant"]').first()
    const content = await assistantMessage.textContent()

    expect(content).toBeTruthy()
    expect(content!.length).toBeGreaterThan(0)
  })

  test('should send "bonjour" and receive a French response', async ({ page }) => {
    // Wait for chat interface to load
    await page.waitForSelector('textarea', { timeout: 10000 })

    // Type "bonjour"
    const textarea = page.locator('textarea')
    await textarea.fill('bonjour')

    // Send the message (Enter key)
    await textarea.press('Enter')

    // Wait for user message to appear
    await expect(page.locator('text=bonjour')).toBeVisible({ timeout: 5000 })

    // Wait for assistant response to start appearing
    await page.waitForSelector('[data-role="assistant"]', { timeout: 15000 })

    // Wait for streaming to complete by checking send button is enabled again
    await page.waitForFunction(
      () => {
        const sendBtn = document.querySelector('#send-btn')
        return sendBtn && !sendBtn.hasAttribute('disabled')
      },
      { timeout: 15000 }
    )

    // Check that assistant message has content
    const assistantMessage = page.locator('[data-role="assistant"]').first()
    const content = await assistantMessage.textContent()

    console.log('🇫🇷 French response:', content)

    expect(content).toBeTruthy()
    expect(content!.length).toBeGreaterThan(0)

    // Check for common French words/patterns to verify language
    const lowerContent = content!.toLowerCase()
    const hasFrenchWords =
      lowerContent.includes('bonjour') ||
      lowerContent.includes('salut') ||
      lowerContent.includes('ça va') ||
      lowerContent.includes('comment') ||
      lowerContent.includes('je suis') ||
      lowerContent.includes('tu es') ||
      lowerContent.includes('vous') ||
      lowerContent.includes('merci')

    expect(hasFrenchWords).toBe(true)
  })
})
