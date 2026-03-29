/**
 * In-memory circular buffer for storing recent logs
 */

export interface LogEntry {
  timestamp: string
  level: string
  message: string
  context?: Record<string, unknown>
}

class LogBuffer {
  private logs: LogEntry[] = []
  private maxSize = 500 // Keep last 500 logs

  add(entry: LogEntry): void {
    this.logs.push(entry)
    if (this.logs.length > this.maxSize) {
      this.logs.shift() // Remove oldest
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
}

export const logBuffer = new LogBuffer()
