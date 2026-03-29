/**
 * API helper utilities for E2E testing
 *
 * Provides utilities for making HTTP requests to the Fastify server
 * and validating responses.
 */

import type { APIRequestContext } from '@playwright/test'

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
 * Make an API request to the server
 */
export async function apiRequest<T = unknown>(
  request: APIRequestContext,
  url: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', headers = {}, body, timeout = 5000 } = options

  const fetchOptions: {
    method: string
    headers: Record<string, string>
    data?: string
    timeout: number
  } = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    timeout,
  }

  if (body) {
    fetchOptions.data = JSON.stringify(body)
  }

  const response = await request.fetch(url, fetchOptions)

  const responseHeaders: Record<string, string> = {}
  const headersObj = response.headers()
  for (const key of Object.keys(headersObj)) {
    responseHeaders[key] = headersObj[key] ?? ''
  }

  let responseBody: T
  const contentType = response.headers()['content-type'] || ''
  if (contentType.includes('application/json')) {
    responseBody = await response.json()
  } else {
    responseBody = (await response.text()) as unknown as T
  }

  return {
    status: response.status(),
    headers: responseHeaders,
    body: responseBody,
  }
}

/**
 * Check server health endpoint
 */
export async function checkHealth(request: APIRequestContext, port: number): Promise<boolean> {
  try {
    const response = await apiRequest(request, `http://localhost:${port}/health`)
    return response.status === 200
  } catch {
    return false
  }
}

/**
 * Get available models
 */
export async function getModels(request: APIRequestContext, port: number): Promise<string[]> {
  const response = await apiRequest<{ data: Array<{ id: string }> }>(
    request,
    `http://localhost:${port}/v1/models`
  )
  return response.body.data?.map(model => model.id) ?? []
}

/**
 * Create a style profile
 */
export async function createStyleProfile(
  request: APIRequestContext,
  port: number,
  profile: { name: string; content: string }
): Promise<ApiResponse<{ id: string; name: string }>> {
  return apiRequest(request, `http://localhost:${port}/v1/style-profiles`, {
    method: 'POST',
    body: profile,
  })
}

/**
 * Get all style profiles
 */
export async function getStyleProfiles(
  request: APIRequestContext,
  port: number
): Promise<ApiResponse<Array<{ id: string; name: string }>>> {
  return apiRequest(request, `http://localhost:${port}/v1/style-profiles`)
}

/**
 * Get all sources
 */
export async function getSources(
  request: APIRequestContext,
  port: number
): Promise<ApiResponse<Array<{ id: string; name: string }>>> {
  return apiRequest(request, `http://localhost:${port}/v1/sources`)
}
