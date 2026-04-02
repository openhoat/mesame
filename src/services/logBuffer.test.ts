import { describe, expect, test, vi } from 'vitest'
import { type LogEntry, logBuffer } from './logBuffer.js'

describe('LogBuffer', () => {
  test('should notify subscribers when a log entry is added', () => {
    const listener = vi.fn()
    const unsubscribe = logBuffer.subscribe(listener)

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'test message',
    }

    logBuffer.add(entry)
    expect(listener).toHaveBeenCalledWith(entry)

    unsubscribe()
    logBuffer.add(entry)
    expect(listener).toHaveBeenCalledTimes(1)
  })

  test('should support multiple subscribers', () => {
    const listener1 = vi.fn()
    const listener2 = vi.fn()
    const unsub1 = logBuffer.subscribe(listener1)
    const unsub2 = logBuffer.subscribe(listener2)

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message: 'multi subscriber test',
    }

    logBuffer.add(entry)
    expect(listener1).toHaveBeenCalledWith(entry)
    expect(listener2).toHaveBeenCalledWith(entry)

    unsub1()
    unsub2()
  })
})
