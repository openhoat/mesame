import type { FastifyPluginAsync } from 'fastify'
import { prisma } from '../db.js'
import { logBuffer } from '../services/logBuffer.js'

interface DashboardStats {
  totalRequests: number
  totalProfiles: number
  avgResponseTime: number
  uptime: string
  recentActivity: ActivityItem[]
}

interface ActivityItem {
  time: string
  event: string
  model?: string
  status: 'success' | 'error'
}

// Track server start time
const serverStartTime = Date.now()

function calculateUptime(): string {
  const uptimeMs = Date.now() - serverStartTime
  const hours = Math.floor(uptimeMs / (1000 * 60 * 60))
  const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}h ${minutes}m`
}

function extractActivityFromLogs(): ActivityItem[] {
  const logs = logBuffer.getRecent(50)

  // Filter and transform logs into activity items
  const activityItems: ActivityItem[] = []

  for (const log of logs) {
    // Look for API calls and style profile updates
    if (log.message.includes('proxy request') || log.message.includes('chat completion')) {
      // Extract model from log message if available
      const modelMatch = log.message.match(/model[:\s]+([^\s,]+)/i)
      const model = modelMatch ? modelMatch[1] : 'unknown'

      activityItems.push({
        time: log.timestamp,
        event: 'Chat completion',
        model,
        status: log.level === 'error' ? 'error' : 'success',
      })
    } else if (log.message.includes('style profile') && log.message.includes('updated')) {
      activityItems.push({
        time: log.timestamp,
        event: 'Style profile updated',
        model: undefined,
        status: log.level === 'error' ? 'error' : 'success',
      })
    }
  }

  // Return last 10 activity items
  return activityItems.slice(-10)
}

export const dashboardRoute: FastifyPluginAsync = async app => {
  // GET /api/stats - Get dashboard statistics
  app.get('/api/stats', async request => {
    request.log.info('[Dashboard API] Fetching statistics...')

    try {
      // Get total requests (count of conversations)
      const totalRequests = await prisma.conversation.count()

      // Get total profiles
      const totalProfiles = await prisma.styleProfile.count()

      // Calculate average response time from logs
      const logs = logBuffer.getAll()
      const proxyLogs = logs.filter(l => l.responseTime !== undefined)
      const avgResponseTime =
        proxyLogs.length > 0
          ? Math.round(
              proxyLogs.reduce((acc, l) => acc + (l.responseTime || 0), 0) / proxyLogs.length
            )
          : 0

      // Calculate uptime
      const uptime = calculateUptime()

      // Extract recent activity from logs
      const recentActivity = extractActivityFromLogs()

      const stats: DashboardStats = {
        totalRequests,
        totalProfiles,
        avgResponseTime,
        uptime,
        recentActivity,
      }

      request.log.info('[Dashboard API] ✅ Statistics fetched successfully')
      return stats
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      request.log.error(`[Dashboard API] ❌ Failed to fetch statistics: ${errorMessage}`)
      throw error
    }
  })
}
