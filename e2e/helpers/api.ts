/**
 * API helper utilities for E2E testing
 *
 * Provides utilities for making HTTP requests to the Fastify server
 * and validating responses.
 */

import type { Page } from '@playwright/test'

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: unknown
  timeout?: number
}

export interface ApiResponse<T = unknown> {
  status: number
  headers: Record<string, string>
  body: T
}

/**
 * Make an HTTP request through the Electron app's renderer page
 *
 * This uses the page's context to make requests, which allows us to
 * properly test the server running within the Electron app.
 */
export async function apiRequest<T = unknown>(
  page: Page,
  url: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', headers = {}, body, timeout = 5000 } = options

  try {
    const response = await page.evaluate(
      async ({ url, method, headers, body, timeout }) => {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        try {
          const response = await fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json',
              ...headers,
            },
            body: body ? JSON.stringify(body) : undefined,
            signal: controller.signal,
          })

          const responseHeaders: Record<string, string> = {}
          response.headers.forEach((value, key) => {
            responseHeaders[key] = value
          })

          const responseBody = await response.text()
          let parsedBody: unknown
          try {
            parsedBody = JSON.parse(responseBody)
          } catch {
            parsedBody = responseBody
          }

          return {
            status: response.status,
            headers: responseHeaders,
            body: parsedBody,
          }
        } catch (error) {
          // Handle fetch errors (network, timeout, etc.)
          return {
            status: 0,
            headers: {},
            body: {
              error: error instanceof Error ? error.message : 'Request failed',
              name: error instanceof Error ? error.name : 'UnknownError',
            },
          }
        } finally {
          clearTimeout(timeoutId)
        }
      },
      { url, method, headers, body, timeout }
    )

    return response as ApiResponse<T>
  } catch (error) {
    throw new Error(
      `API request to ${url} failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Check if the server is healthy
 */
export async function checkHealth(page: Page, port: number): Promise<boolean> {
  try {
    const response = await apiRequest(page, `http://localhost:${port}/health`)
    return response.status === 200
  } catch {
    return false
  }
}

/**
 * Get the list of sources
 */
export async function getSources(page: Page, port: number): Promise<ApiResponse> {
  return apiRequest(page, `http://localhost:${port}/v1/sources`)
}

/**
 * Upload a source file
 */
export async function uploadSource(
  page: Page,
  port: number,
  filename: string,
  content: string
): Promise<ApiResponse> {
  return page.evaluate(
    async ({ url, filename, content }) => {
      const formData = new FormData()
      const blob = new Blob([content], { type: 'text/plain' })
      formData.append('file', blob, filename)

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      })

      const responseHeaders: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })

      const responseBody = await response.text()
      let parsedBody: unknown
      try {
        parsedBody = JSON.parse(responseBody)
      } catch {
        parsedBody = responseBody
      }

      return {
        status: response.status,
        headers: responseHeaders,
        body: parsedBody,
      }
    },
    {
      url: `http://localhost:${port}/v1/sources/import`,
      filename,
      content,
    }
  )
}
