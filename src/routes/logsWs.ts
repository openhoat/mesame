import type { FastifyPluginAsync } from 'fastify'
import type { WebSocket } from 'ws'
import { logBuffer } from '../services/logBuffer.js'

export const logsWsRoute: FastifyPluginAsync = async app => {
  app.get('/api/logs/ws', { websocket: true }, (socket: WebSocket) => {
    const unsubscribe = logBuffer.subscribe(entry => {
      if (socket.readyState === socket.OPEN) {
        socket.send(JSON.stringify(entry))
      }
    })

    socket.on('close', () => {
      unsubscribe()
    })

    socket.on('error', () => {
      unsubscribe()
    })
  })
}
