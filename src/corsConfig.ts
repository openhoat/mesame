/**
 * CORS configuration utility
 *
 * Parses CORS_ORIGIN environment variable to configure allowed origins.
 *
 * Examples:
 *   CORS_ORIGIN=https://app.mesame.com                    -> Single origin
 *   CORS_ORIGIN=https://app.mesame.com,https://admin.mesame.com -> Multiple origins
 *   CORS_ORIGIN=*                                          -> All origins (same as true)
 *   CORS_ORIGIN not set                                   -> All origins (development mode)
 */

/**
 * Parse CORS origin from environment variable
 * @returns Fastify CORS origin configuration
 */
export function parseCorsOrigin(): boolean | string | string[] {
  const corsOrigin = process.env.CORS_ORIGIN

  // No configuration: allow all origins (development mode)
  if (!corsOrigin) {
    return true
  }

  // Wildcard: allow all origins
  if (corsOrigin === '*') {
    return true
  }

  // Single or multiple origins (comma-separated)
  const origins = corsOrigin
    .split(',')
    .map(origin => origin.trim())
    .filter((origin): origin is string => origin.length > 0)

  // Single origin: return as string
  if (origins.length === 1 && origins[0]) {
    return origins[0]
  }

  // Multiple origins: return as array
  return origins
}
