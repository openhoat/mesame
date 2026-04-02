import type { FastifyInstance } from 'fastify'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { buildApp } from '../app.js'
import { logBuffer } from '../services/logBuffer.js'

// Mock the logBuffer module
vi.mock('../services/logBuffer.js', () => {
  const listeners = new Set<(entry: unknown) => void>()
  return {
    logBuffer: {
      getRecent: vi.fn().mockReturnValue([]),
      getAll: vi.fn().mockReturnValue([]),
      add: vi.fn(),
      clear: vi.fn(),
      subscribe: vi.fn((listener: (entry: unknown) => void) => {
        listeners.add(listener)
        return () => {
          listeners.delete(listener)
        }
      }),
      _listeners: listeners,
    },
  }
})

// Mock Prisma
vi.mock('../db.js', () => ({
  prisma: {
    conversation: { count: vi.fn().mockResolvedValue(0) },
    styleProfile: { count: vi.fn().mockResolvedValue(0) },
    $disconnect: vi.fn(),
  },
}))

describe('Logs WebSocket Route', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    app = await buildApp()
    await app.ready()
  })

  afterEach(async () => {
    await app.close()
    vi.clearAllMocks()
  })

  test('should accept WebSocket connections on /api/logs/ws', async () => {
    const ws = await app.injectWS('/api/logs/ws')
    expect(ws.readyState).toBe(ws.OPEN)
    expect(logBuffer.subscribe).toHaveBeenCalled()
    ws.close()
  })

  test('should broadcast log entries to connected WebSocket clients', async () => {
    const ws = await app.injectWS('/api/logs/ws')

    const entry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'test broadcast',
    }

    // Get the listener that was registered via subscribe
    const subscribeCall = vi.mocked(logBuffer.subscribe).mock.calls[0]
    const listener = subscribeCall[0]

    const messagePromise = new Promise<string>(resolve => {
      ws.on('message', (data: Buffer) => {
        resolve(data.toString())
      })
    })

    // Simulate a log entry being added
    listener(entry)

    const received = await messagePromise
    expect(JSON.parse(received)).toEqual(entry)

    ws.close()
  })
})
