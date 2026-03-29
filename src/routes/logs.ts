import type { FastifyPluginAsync } from 'fastify'
import { logBuffer } from '../services/logBuffer.js'

export const logsRoute: FastifyPluginAsync = async app => {
  // GET /api/logs - Get recent logs
  app.get('/api/logs', async request => {
    const { limit } = request.query as { limit?: string }
    const maxLogs = limit ? Number.parseInt(limit, 10) : 100

    const logs = logBuffer.getRecent(maxLogs)
    return { logs, count: logs.length }
  })

  // DELETE /api/logs - Clear logs
  app.delete('/api/logs', async () => {
    logBuffer.clear()
    return { success: true, message: 'Logs cleared' }
  })
}
