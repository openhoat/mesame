/**
 * API configuration for frontend
 *
 * In development: uses Vite proxy, so URLs are relative
 * In production (CDN): uses VITE_API_URL environment variable
 */

/**
 * Get the API base URL from environment variable
 * In development, this will be empty (uses Vite proxy)
 * In production (CDN deployment), set VITE_API_URL to the backend URL
 *
 * Example: VITE_API_URL=https://api.mesame.com
 */
const API_BASE_URL = import.meta.env.VITE_API_URL ?? ''

/**
 * Build full API URL
 * In development with Vite proxy: returns relative URL
 * In production (CDN): returns absolute URL to backend
 */
export function apiUrl(path: string): string {
  // Remove leading slash if API_BASE_URL already has one
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL
  const pathWithSlash = path.startsWith('/') ? path : `/${path}`
  return `${base}${pathWithSlash}`
}

/**
 * API endpoints
 */
export const API = {
  // Web server endpoints (port 3001)
  config: () => apiUrl('/api/config'),
  settings: () => apiUrl('/api/settings'),
  providers: () => apiUrl('/api/providers'),
  providerModels: (name: string) => apiUrl(`/api/providers/${name}/models`),
  sources: () => apiUrl('/api/sources'),
  sourceById: (id: string) => apiUrl(`/api/sources/${id}`),
  sourcesImport: () => apiUrl('/api/sources/import'),
  styleProfile: () => apiUrl('/api/style-profile'),
  styleProfileById: (id: string) => apiUrl(`/api/style-profile/${id}`),
  styleProfileActivate: (id: string) => apiUrl(`/api/style-profile/${id}/activate`),
  styleProfileRegenerate: (id: string) => apiUrl(`/api/style-profile/${id}/regenerate`),
  styleProfileGenerate: () => apiUrl('/api/style-profile/generate'),
  styleProfileExport: () => apiUrl('/api/style-profile/export'),
  logs: (limit = 100) => apiUrl(`/api/logs?limit=${limit}`),
  stats: () => apiUrl('/api/stats'),
  health: () => apiUrl('/health'),

  // LLM server endpoints (port 3000, proxied through web server)
  chatCompletions: () => apiUrl('/v1/chat/completions'),
  models: () => apiUrl('/v1/models'),
  conversations: () => apiUrl('/v1/conversations'),
  conversationById: (id: string) => apiUrl(`/v1/conversations/${id}`),
  conversationsExport: () => apiUrl('/v1/conversations/export'),
} as const
