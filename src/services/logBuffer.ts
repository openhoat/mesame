/**
 * In-memory circular buffer for storing recent logs
 */

export interface LogEntry {
  timestamp: string
  level: string
  message: string
  responseTime?: number
  context?: Record<string, unknown>
}

export type LogListener = (entry: LogEntry) => void

class LogBuffer {
  private logs: LogEntry[] = []
  private maxSize = 500 // Keep last 500 logs
  private listeners: Set<LogListener> = new Set()

  add(entry: LogEntry): void {
    this.logs.push(entry)
    if (this.logs.length > this.maxSize) {
      this.logs.shift() // Remove oldest
    }
    for (const listener of this.listeners) {
      listener(entry)
    }
  }

  getAll(): LogEntry[] {
    return [...this.logs]
  }

  getRecent(count: number): LogEntry[] {
    return this.logs.slice(-count)
  }

  clear(): void {
    this.logs = []
  }

  subscribe(listener: LogListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }
}

export const logBuffer = new LogBuffer()
