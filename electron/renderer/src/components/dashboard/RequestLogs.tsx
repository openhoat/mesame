import { Activity, Download, RefreshCw, Search } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface RequestLog {
  id: string
  timestamp: string
  method: string
  endpoint: string
  statusCode: number
  duration: number
  model?: string
  tokens?: number
}

export function RequestLogs() {
  const [logs, setLogs] = useState<RequestLog[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(false)

  const fetchLogs = useCallback(() => {
    // Mock data - replace with actual API call
    const mockLogs: RequestLog[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 120000).toISOString(),
        method: 'POST',
        endpoint: '/v1/chat/completions',
        statusCode: 200,
        duration: 1245,
        model: 'gpt-4o-mini',
        tokens: 1523,
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        method: 'GET',
        endpoint: '/v1/models',
        statusCode: 200,
        duration: 45,
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 450000).toISOString(),
        method: 'POST',
        endpoint: '/v1/chat/completions',
        statusCode: 500,
        duration: 234,
        model: 'gpt-4o',
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        method: 'POST',
        endpoint: '/v1/chat/completions',
        statusCode: 200,
        duration: 2150,
        model: 'gpt-4o',
        tokens: 3421,
      },
    ]
    setLogs(mockLogs)
  }, [])

  useEffect(() => {
    fetchLogs()

    if (autoRefresh) {
      const interval = setInterval(fetchLogs, 5000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, fetchLogs])

  const filteredLogs = logs.filter(
    log =>
      log.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.model?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (code: number) => {
    if (code >= 200 && code < 300) return <Badge variant="default">Success</Badge>
    if (code >= 400 && code < 500) return <Badge variant="destructive">Client Error</Badge>
    if (code >= 500) return <Badge variant="destructive">Server Error</Badge>
    return <Badge variant="secondary">{code}</Badge>
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const formatTimestamp = (iso: string) => {
    const date = new Date(iso)
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Request Logs</h1>
          <p className="text-muted-foreground">Monitor API requests and responses</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setAutoRefresh(!autoRefresh)}>
            <RefreshCw className={`mr-2 h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by endpoint, method, or model..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Requests</CardTitle>
          <CardDescription>
            {filteredLogs.length} request{filteredLogs.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">No requests found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map(log => (
                <div
                  key={log.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono">
                        {log.method}
                      </Badge>
                      <code className="text-sm">{log.endpoint}</code>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{formatTimestamp(log.timestamp)}</span>
                      <span>{formatDuration(log.duration)}</span>
                      {log.model && <span>Model: {log.model}</span>}
                      {log.tokens && <span>{log.tokens.toLocaleString()} tokens</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">{getStatusBadge(log.statusCode)}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
