/**
 * Chat interface E2E tests
 *
 * These tests verify the chat UI renders correctly,
 * handles user input, and displays streaming responses.
 */

import { expect, test } from '../fixtures.js'

test.describe('Chat Interface', () => {
  test('should display the welcome screen on load', async ({ electronApp }) => {
    const { page } = electronApp
    await page.waitForLoadState('networkidle')

    // Welcome section is visible
    const welcome = page.locator('#welcome')
    await expect(welcome).toBeVisible()
    await expect(welcome.locator('h2')).toHaveText('MeSame Chat')

    // Input area is visible
    const input = page.locator('#input')
    await expect(input).toBeVisible()

    // Send button exists but is disabled
    const sendBtn = page.locator('#send-btn')
    await expect(sendBtn).toBeDisabled()
  })

  test('should show connection status indicator', async ({ electronApp }) => {
    const { page } = electronApp
    await page.waitForLoadState('networkidle')

    // Wait for health check to complete
    await expect(page.locator('#status-dot')).toHaveClass(/connected/, { timeout: 15000 })
    await expect(page.locator('#status-label')).toHaveText('Connected')
  })

  test('should enable send button when typing a message', async ({ electronApp }) => {
    const { page } = electronApp
    await page.waitForLoadState('networkidle')

    const input = page.locator('#input')
    const sendBtn = page.locator('#send-btn')

    // Initially disabled
    await expect(sendBtn).toBeDisabled()

    // Type a message
    await input.fill('Hello')
    await expect(sendBtn).toBeEnabled()

    // Clear the message
    await input.fill('')
    await expect(sendBtn).toBeDisabled()
  })

  test('should send a message and display user bubble', async ({ electronApp }) => {
    const { page } = electronApp
    await page.waitForLoadState('networkidle')

    const input = page.locator('#input')

    // Type and send a message
    await input.fill('Hello from E2E test')
    await page.keyboard.press('Enter')

    // User message bubble should appear
    const userMessage = page.locator('.message.user .message-content')
    await expect(userMessage).toBeVisible()
    await expect(userMessage).toHaveText('Hello from E2E test')

    // Welcome screen should be gone
    await expect(page.locator('#welcome')).toHaveCount(0)

    // Input should be cleared after sending
    await expect(input).toHaveValue('')
  })

  test('should display assistant response or error after sending', async ({ electronApp }) => {
    const { page } = electronApp
    await page.waitForLoadState('networkidle')

    const input = page.locator('#input')

    // Send a message
    await input.fill('Say hello')
    await page.keyboard.press('Enter')

    // Wait for the streaming to complete: either an assistant message with content
    // or an error message. The assistant bubble appears empty first during streaming,
    // so we wait for non-empty content or an error.
    const assistantWithContent = page.locator(
      '.message.assistant .message-content:not(.streaming-cursor)'
    )
    const errorMessage = page.locator('.message.error .message-content')

    await expect(assistantWithContent.or(errorMessage)).toBeVisible({ timeout: 30000 })

    // Verify whichever appeared has content
    const visibleMessage = (await errorMessage.isVisible()) ? errorMessage : assistantWithContent
    await expect(visibleMessage).not.toBeEmpty()
  })

  test('should support Shift+Enter for newline without sending', async ({ electronApp }) => {
    const { page } = electronApp
    await page.waitForLoadState('networkidle')

    const input = page.locator('#input')

    // Type first line
    await input.fill('Line 1')
    // Shift+Enter should add a newline, not send
    await page.keyboard.press('Shift+Enter')
    await page.keyboard.type('Line 2')

    // Message should not have been sent (no user bubble)
    await expect(page.locator('.message.user')).toHaveCount(0)

    // Input should contain both lines
    const value = await input.inputValue()
    expect(value).toContain('Line 1')
    expect(value).toContain('Line 2')
  })

  test('should display header with branding', async ({ electronApp }) => {
    const { page } = electronApp
    await page.waitForLoadState('domcontentloaded')

    await expect(page.locator('.header-title')).toHaveText('MeSame')
    await expect(page.locator('.header-subtitle')).toHaveText('Your personal style proxy')
  })
})
