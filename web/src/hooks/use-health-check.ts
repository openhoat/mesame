import { useCallback, useEffect, useState } from 'react'
import { checkHealth } from '@/services/chat-api'

const HEALTH_CHECK_INTERVAL = 10_000

export function useHealthCheck() {
  const [isConnected, setIsConnected] = useState(false)

  const check = useCallback(async () => {
    const healthy = await checkHealth()
    setIsConnected(healthy)
  }, [])

  useEffect(() => {
    check()
    const interval = setInterval(check, HEALTH_CHECK_INTERVAL)
    return () => clearInterval(interval)
  }, [check])

  return { isConnected }
}
