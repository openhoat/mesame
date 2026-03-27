import {
  Badge,
  Button,
  Code,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { Activity, Download, RefreshCw, Search } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()
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
    if (code >= 200 && code < 300) return <Badge color="green">{t('logs.status.success')}</Badge>
    if (code >= 400 && code < 500)
      return <Badge color="orange">{t('logs.status.clientError')}</Badge>
    if (code >= 500) return <Badge color="red">{t('logs.status.serverError')}</Badge>
    return <Badge color="gray">{code}</Badge>
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
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={1}>{t('logs.title')}</Title>
          <Text c="dimmed">{t('logs.subtitle')}</Text>
        </div>
        <Group gap="xs">
          <Button
            variant="default"
            leftSection={<RefreshCw size={16} className={autoRefresh ? 'animate-spin' : ''} />}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? t('logs.autoRefreshOn') : t('logs.autoRefreshOff')}
          </Button>
          <Button variant="default" leftSection={<Download size={16} />}>
            {t('logs.export')}
          </Button>
        </Group>
      </Group>

      {/* Search & Filters */}
      <Paper shadow="sm" p="md" withBorder>
        <Stack gap="md">
          <Title order={3} size="h4">
            {t('logs.filters')}
          </Title>
          <TextInput
            placeholder={t('logs.searchPlaceholder')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            leftSection={<Search size={16} />}
          />
        </Stack>
      </Paper>

      {/* Logs Table */}
      <Paper shadow="sm" p="md" withBorder>
        <Stack gap="md">
          <div>
            <Title order={3}>{t('logs.recentRequests')}</Title>
            <Text size="sm" c="dimmed">
              {t('logs.requestsFound', { count: filteredLogs.length })}
            </Text>
          </div>

          {filteredLogs.length === 0 ? (
            <Stack align="center" gap="md" py="xl">
              <Activity size={48} opacity={0.5} />
              <Text size="sm" c="dimmed">
                {t('logs.noRequests')}
              </Text>
            </Stack>
          ) : (
            <Stack gap="md">
              {filteredLogs.map((log, index, arr) => (
                <div key={log.id}>
                  <Group justify="space-between" align="flex-start">
                    <Stack gap={4} style={{ flex: 1 }}>
                      <Group gap="xs">
                        <Badge variant="outline" tt="uppercase" ff="monospace">
                          {log.method}
                        </Badge>
                        <Code>{log.endpoint}</Code>
                      </Group>
                      <Group gap="md">
                        <Text size="xs" c="dimmed">
                          {formatTimestamp(log.timestamp)}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {formatDuration(log.duration)}
                        </Text>
                        {log.model && (
                          <Text size="xs" c="dimmed">
                            {t('logs.model', { model: log.model })}
                          </Text>
                        )}
                        {log.tokens && (
                          <Text size="xs" c="dimmed">
                            {t('logs.tokens', { count: log.tokens })}
                          </Text>
                        )}
                      </Group>
                    </Stack>
                    {getStatusBadge(log.statusCode)}
                  </Group>
                  {index < arr.length - 1 && <Divider my="sm" />}
                </div>
              ))}
            </Stack>
          )}
        </Stack>
      </Paper>
    </Stack>
  )
}
