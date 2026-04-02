import { useCallback, useEffect, useRef, useState } from 'react'
import { API } from '@/config/api'

export interface LogEntry {
  timestamp: string
  level: string
  message: string
  responseTime?: number
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected'

const RECONNECT_DELAY_MS = 3000

export const useLogWebSocket = (enabled: boolean) => {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout>>()

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    setStatus('connecting')
    const ws = new WebSocket(API.logsWs())
    wsRef.current = ws

    ws.onopen = () => {
      setStatus('connected')
    }

    ws.onmessage = (event: MessageEvent) => {
      const entry: LogEntry = JSON.parse(String(event.data))
      setLogs(prev => {
        const next = [...prev, entry]
        return next.length > 500 ? next.slice(-500) : next
      })
    }

    ws.onclose = () => {
      setStatus('disconnected')
      wsRef.current = null
      if (enabled) {
        reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY_MS)
      }
    }

    ws.onerror = () => {
      ws.close()
    }
  }, [enabled])

  useEffect(() => {
    if (enabled) {
      // Fetch initial logs via HTTP, then connect WebSocket
      fetch(API.logs(500))
        .then(res => res.json())
        .then(data => {
          if (data.logs) {
            setLogs(data.logs)
          }
        })
        .catch(() => {
          // Ignore fetch errors - WebSocket will provide live data
        })
      connect()
    } else {
      wsRef.current?.close()
      wsRef.current = null
      setStatus('disconnected')
    }

    return () => {
      clearTimeout(reconnectTimerRef.current)
      wsRef.current?.close()
      wsRef.current = null
    }
  }, [enabled, connect])

  return { logs, status, clearLogs }
}
