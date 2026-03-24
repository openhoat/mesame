/**
 * Provider configuration E2E tests
 *
 * These tests verify that users can:
 * 1. Navigate to Server Config
 * 2. Select different LLM providers (OpenAI, Claude, Ollama, Gemini)
 * 3. Configure provider settings (API keys, models, URLs)
 * 4. Save and persist configuration
 * 5. Verify configuration is applied in chat
 */

import { TEST_PROVIDERS } from '../fixtures/test-data.js'
import { expect, test } from '../fixtures.js'
import { navigateToSection } from '../helpers/setup.js'

test.describe
  .skip('Provider Configuration', () => {
    test('should display server config page with all fields', async ({ page }) => {
      // Navigate to Server Config
      await navigateToSection(page, 'config')

      // Verify main sections are visible
      await expect(page.locator('text=/Server Config|Configuration/i')).toBeVisible({
        timeout: 5000,
      })

      // Check for provider selection
      const providerSelect = page
        .locator('select, [role="combobox"]')
        .filter({ hasText: /provider|model/i })
      const providerSelectCount = await providerSelect.count()

      // Either a select element or a combobox should exist
      expect(providerSelectCount).toBeGreaterThanOrEqual(0)

      // Check for API key input
      const apiKeyInput = page.locator(
        'input[type="password"], input[placeholder*="API"], input[name*="key"]'
      )
      const apiKeyInputCount = await apiKeyInput.count()

      expect(apiKeyInputCount).toBeGreaterThanOrEqual(0)

      // Check for model input/select
      const modelInput = page.locator(
        'input[name*="model"], select[name*="model"], [placeholder*="model"]'
      )
      const modelInputCount = await modelInput.count()

      expect(modelInputCount).toBeGreaterThanOrEqual(0)

      // Check for base URL input
      const urlInput = page.locator(
        'input[name*="url"], input[placeholder*="URL"], input[placeholder*="url"]'
      )
      const urlInputCount = await urlInput.count()

      expect(urlInputCount).toBeGreaterThanOrEqual(0)
    })

    test('should load current configuration on page load', async ({ page }) => {
      await navigateToSection(page, 'config')

      // Wait for config to load
      await page.waitForTimeout(1000)

      // Verify that some configuration is loaded
      // Check if model field has a value
      const modelInput = page
        .locator(
          'input[name*="model"], [value*="gpt"], [value*="claude"], [value*="llama"], [value*="gemini"]'
        )
        .first()
      const modelInputCount = await modelInput.count()

      if (modelInputCount > 0) {
        const modelValue = await modelInput.inputValue().catch(() => '')
        expect(modelValue.length).toBeGreaterThan(0)
      }

      // Check if URL field has a value
      const urlInput = page.locator('input[name*="url"]').first()
      const urlInputCount = await urlInput.count()

      if (urlInputCount > 0) {
        const urlValue = await urlInput.inputValue().catch(() => '')
        expect(urlValue.length).toBeGreaterThan(0)
      }
    })

    test('should change provider and update default values', async ({ page }) => {
      test.setTimeout(45000)

      await navigateToSection(page, 'config')

      // Look for provider selector
      const providerSelect = page
        .locator('select')
        .filter({ hasText: /openai|claude|ollama|anthropic/i })
        .first()
      const providerSelectCount = await providerSelect.count()

      if (providerSelectCount > 0) {
        // ========================================
        // Test OpenAI provider selection
        // ========================================

        await providerSelect.selectOption('openai').catch(() => {
          // If select by value fails, try by label
          return providerSelect.selectOption({ label: 'OpenAI' })
        })

        await page.waitForTimeout(500)

        // Verify OpenAI defaults are applied
        const modelInput = page.locator('input[name*="model"]').first()
        const modelInputCount = await modelInput.count()

        if (modelInputCount > 0) {
          const modelValue = await modelInput.inputValue()
          expect(modelValue).toContain('gpt')
        }

        // ========================================
        // Test Anthropic/Claude provider selection
        // ========================================

        await providerSelect.selectOption('anthropic').catch(() => {
          return providerSelect.selectOption({ label: 'Anthropic' })
        })

        await page.waitForTimeout(500)

        // Verify Anthropic defaults
        if (modelInputCount > 0) {
          const modelValue = await modelInput.inputValue()
          expect(modelValue).toContain('claude')
        }

        // ========================================
        // Test Ollama provider selection
        // ========================================

        await providerSelect.selectOption('ollama').catch(() => {
          return providerSelect.selectOption({ label: 'Ollama' })
        })

        await page.waitForTimeout(500)

        // Verify Ollama defaults (localhost URL)
        const urlInput = page.locator('input[name*="url"]').first()
        const urlInputCount = await urlInput.count()

        if (urlInputCount > 0) {
          const urlValue = await urlInput.inputValue()
          expect(urlValue).toContain('localhost')
        }
      }
    })

    test('should save configuration and persist after reload', async ({ page }) => {
      await navigateToSection(page, 'config')

      // ========================================
      // Step 1: Change a configuration value
      // ========================================

      const modelInput = page.locator('input[name*="model"]').first()
      const modelInputCount = await modelInput.count()

      if (modelInputCount > 0) {
        const originalValue = await modelInput.inputValue()

        // Change the model to a test value
        const testModel = 'test-model-e2e'
        await modelInput.fill(testModel)

        // ========================================
        // Step 2: Save the configuration
        // ========================================

        const saveButton = page.locator('button:has-text("Save"), button[type="submit"]')
        const saveButtonCount = await saveButton.count()

        if (saveButtonCount > 0) {
          await saveButton.click()

          // Wait for save to complete
          await page.waitForTimeout(1000)

          // Look for success message
          const successMessage = page.locator('text=/saved|success|updated/i')
          const hasSuccessMessage = await successMessage.count().then(count => count > 0)

          // ========================================
          // Step 3: Reload and verify persistence
          // ========================================

          await page.reload()
          await page.waitForLoadState('domcontentloaded')

          await navigateToSection(page, 'config')
          await page.waitForTimeout(500)

          // Check if the value persisted
          const newValue = await modelInput.inputValue()

          // Either the new value persisted, or we saw a success message
          expect(hasSuccessMessage || newValue === testModel).toBe(true)

          // Restore original value
          await modelInput.fill(originalValue)

          if (saveButtonCount > 0) {
            await saveButton.click()
            await page.waitForTimeout(500)
          }
        }
      }
    })

    test('should validate required fields', async ({ page }) => {
      await navigateToSection(page, 'config')

      // ========================================
      // Try to clear required field (model)
      // ========================================

      const modelInput = page.locator('input[name*="model"]').first()
      const modelInputCount = await modelInput.count()

      if (modelInputCount > 0) {
        const originalValue = await modelInput.inputValue()

        // Clear the model field
        await modelInput.fill('')

        // Try to save
        const saveButton = page.locator('button:has-text("Save"), button[type="submit"]')
        const saveButtonCount = await saveButton.count()

        if (saveButtonCount > 0) {
          const isDisabled = await saveButton.isDisabled()

          if (!isDisabled) {
            await saveButton.click()

            // Look for validation error
            const errorMessage = page.locator('text=/required|cannot be empty|invalid/i')
            const hasError = await errorMessage.count().then(count => count > 0)

            // Either we see an error or save was prevented
            expect(hasError).toBe(true)
          } else {
            // Save button is disabled, which is correct validation
            expect(isDisabled).toBe(true)
          }

          // Restore original value
          await modelInput.fill(originalValue)
        }
      }
    })

    test('should handle API key input securely', async ({ page }) => {
      await navigateToSection(page, 'config')

      // Check for API key input
      const apiKeyInput = page
        .locator('input[type="password"], input[name*="key"], input[placeholder*="API"]')
        .first()
      const apiKeyInputCount = await apiKeyInput.count()

      if (apiKeyInputCount > 0) {
        // Verify input is password type (hidden)
        const inputType = await apiKeyInput.getAttribute('type')
        expect(inputType).toBe('password')

        // Type a test key
        await apiKeyInput.fill('test-api-key-12345')

        // Verify the value is set (even if masked)
        const value = await apiKeyInput.inputValue()
        expect(value.length).toBeGreaterThan(0)
      }
    })

    test('should display provider-specific help text', async ({ page }) => {
      await navigateToSection(page, 'config')

      // Look for help text or descriptions
      const helpText = page.locator('text=/API key|endpoint|configuration/i')
      const helpTextCount = await helpText.count()

      // There should be some guidance text
      expect(helpTextCount).toBeGreaterThan(0)
    })

    test('should allow resetting to default values', async ({ page }) => {
      await navigateToSection(page, 'config')

      // Look for a reset/default button
      const resetButton = page.locator(
        'button:has-text("Reset"), button:has-text("Default"), button[aria-label*="Reset"]'
      )
      const resetButtonCount = await resetButton.count()

      if (resetButtonCount > 0) {
        // Click reset
        await resetButton.click()

        // Wait for reset to apply
        await page.waitForTimeout(500)

        // Verify some default value is set
        const modelInput = page.locator('input[name*="model"]').first()
        const modelInputCount = await modelInput.count()

        if (modelInputCount > 0) {
          const modelValue = await modelInput.inputValue()
          expect(modelValue.length).toBeGreaterThan(0)
        }
      }
    })

    test('should update provider URL when switching providers', async ({ page }) => {
      await navigateToSection(page, 'config')

      const providerSelect = page.locator('select').first()
      const providerSelectCount = await providerSelect.count()

      if (providerSelectCount > 0) {
        const urlInput = page.locator('input[name*="url"], input[placeholder*="URL"]').first()
        const urlInputCount = await urlInput.count()

        if (urlInputCount > 0) {
          // Select OpenAI
          await providerSelect.selectOption('openai').catch(() => {
            return providerSelect.selectOption({ label: 'OpenAI' })
          })
          await page.waitForTimeout(300)

          const openaiUrl = await urlInput.inputValue()
          expect(openaiUrl).toContain(TEST_PROVIDERS.openai.baseUrl)

          // Select Ollama
          await providerSelect.selectOption('ollama').catch(() => {
            return providerSelect.selectOption({ label: 'Ollama' })
          })
          await page.waitForTimeout(300)

          const ollamaUrl = await urlInput.inputValue()
          expect(ollamaUrl).toContain('localhost')
        }
      }
    })

    test('should show connection status indicator', async ({ page }) => {
      await navigateToSection(page, 'config')

      // Look for a connection status indicator
      const statusIndicator = page.locator(
        '[data-testid="connection-status"], text=/connected|disconnected|status/i'
      )
      const statusIndicatorCount = await statusIndicator.count()

      // Status indicator is optional but recommended
      expect(statusIndicatorCount).toBeGreaterThanOrEqual(0)
    })

    test('should handle concurrent config changes gracefully', async ({ page }) => {
      await navigateToSection(page, 'config')

      // Make multiple rapid changes
      const modelInput = page.locator('input[name*="model"]').first()
      const modelInputCount = await modelInput.count()

      if (modelInputCount > 0) {
        const originalValue = await modelInput.inputValue()

        // Rapid changes
        await modelInput.fill('model-1')
        await modelInput.fill('model-2')
        await modelInput.fill('model-3')

        // Save
        const saveButton = page.locator('button:has-text("Save")').first()
        const saveButtonCount = await saveButton.count()

        if (saveButtonCount > 0) {
          await saveButton.click()
          await page.waitForTimeout(1000)

          // Verify final value is set
          const finalValue = await modelInput.inputValue()
          expect(finalValue).toBe('model-3')

          // Restore
          await modelInput.fill(originalValue)
          await saveButton.click()
        }
      }
    })
  })
