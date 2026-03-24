/**
 * Chat interface E2E tests
 *
 * These tests verify the chat UI renders correctly,
 * handles user input, and displays streaming responses.
 */

import { expect, test } from '../fixtures.js'

test.describe
  .skip('Chat Interface', () => {
    // Navigate to chat page before each test (since dashboard is now the default page)
    test.beforeEach(async ({ electronApp }) => {
      const { page } = electronApp
      await page.waitForLoadState('networkidle')

      // Click on the Chat link in the sidebar to navigate to chat
      // NavLink from Mantine is not a button, use text selector instead
      const chatLink = page.getByText('Chat', { exact: true })
      await chatLink.click()

      // Wait for chat to load by checking for the chat input
      await expect(page.locator('#input')).toBeVisible({ timeout: 5000 })
    })

    test('should display the welcome screen on load', async ({ electronApp }) => {
      const { page } = electronApp

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

      // Wait for health check to complete
      await expect(page.locator('#status-dot')).toHaveClass(/connected/, { timeout: 15000 })
      await expect(page.locator('#status-label')).toHaveText('Connected')
    })

    test('should enable send button when typing a message', async ({ electronApp }) => {
      const { page } = electronApp

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

      const input = page.locator('#input')

      // Send a message
      await input.fill('Say hello')
      await page.keyboard.press('Enter')

      // Wait for either an assistant message or an error message to appear.
      // In CI without an API key, the assistant bubble may appear empty
      // (no streaming content and no error message), so we only verify
      // that a response element is rendered.
      const assistantMessage = page.locator('.message.assistant .message-content')
      const errorMessage = page.locator('.message.error .message-content')

      await expect(assistantMessage.or(errorMessage)).toBeVisible({ timeout: 30000 })
    })

    test('should support Shift+Enter for newline without sending', async ({ electronApp }) => {
      const { page } = electronApp

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

      await expect(page.locator('.header-title')).toHaveText('MeSame')
      await expect(page.locator('.header-subtitle')).toHaveText('Your personal style proxy')
    })
  })
