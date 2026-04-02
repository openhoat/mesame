import { Badge, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core'
import { Activity, Download, RefreshCw, Search } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { API } from '@/config/api'

interface LogEntry {
  timestamp: string
  level: string
  message: string
}

export function RequestLogs() {
  const { t } = useTranslation()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchLogs = useCallback(async () => {
    try {
      const response = await fetch(API.logs(100))
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs || [])
      }
    } catch (_error) {
      // Silently fail to avoid disrupting the UI
    }
  }, [])

  useEffect(() => {
    fetchLogs()

    if (autoRefresh) {
      const interval = setInterval(fetchLogs, 5000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, fetchLogs])

  const filteredLogs = logs.filter(log =>
    log.message.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getLevelBadge = (level: string) => {
    const levelLower = level.toLowerCase()
    if (levelLower === 'error') return <Badge color="red">ERROR</Badge>
    if (levelLower === 'warn') return <Badge color="orange">WARN</Badge>
    if (levelLower === 'info') return <Badge color="blue">INFO</Badge>
    if (levelLower === 'debug') return <Badge color="gray">DEBUG</Badge>
    return <Badge color="gray">{level.toUpperCase()}</Badge>
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
            <Stack gap="xs">
              {filteredLogs.map(log => (
                <Paper
                  key={`${log.timestamp}-${log.level}-${log.message.substring(0, 50)}`}
                  p="xs"
                  withBorder
                  style={{ fontFamily: 'monospace', fontSize: '12px' }}
                >
                  <Group gap="xs" wrap="nowrap">
                    <Text size="xs" c="dimmed" style={{ minWidth: '140px' }}>
                      {formatTimestamp(log.timestamp)}
                    </Text>
                    {getLevelBadge(log.level)}
                    <Text size="xs" style={{ flex: 1, wordBreak: 'break-word' }}>
                      {log.message}
                    </Text>
                  </Group>
                </Paper>
              ))}
            </Stack>
          )}
        </Stack>
      </Paper>
    </Stack>
  )
}
