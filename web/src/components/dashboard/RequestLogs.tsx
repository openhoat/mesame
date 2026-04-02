import { Badge, Button, Group, Paper, Stack, Text, TextInput, Title, Tooltip } from '@mantine/core'
import { Activity, Download, Search, Wifi, WifiOff } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLogWebSocket } from '@/hooks/use-log-websocket'

export function RequestLogs() {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [streaming, setStreaming] = useState(true)
  const { logs, status, clearLogs } = useLogWebSocket(streaming)

  const filteredLogs = logs.filter(log =>
    log.message.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getLevelBadge = (level: string) => {
    const levelLower = level.toLowerCase()
    if (levelLower === 'error')
      return (
        <Badge color="red" size="xs">
          ERR
        </Badge>
      )
    if (levelLower === 'warn')
      return (
        <Badge color="orange" size="xs">
          WRN
        </Badge>
      )
    if (levelLower === 'info')
      return (
        <Badge color="blue" size="xs">
          INF
        </Badge>
      )
    if (levelLower === 'debug')
      return (
        <Badge color="gray" size="xs">
          DBG
        </Badge>
      )
    return (
      <Badge color="gray" size="xs">
        {level.substring(0, 3).toUpperCase()}
      </Badge>
    )
  }

  const formatTimestamp = (iso: string) => {
    const date = new Date(iso)
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date)
  }

  const statusColor = status === 'connected' ? 'green' : status === 'connecting' ? 'yellow' : 'red'
  const StatusIcon = status === 'connected' ? Wifi : WifiOff

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={1}>{t('logs.title')}</Title>
          <Text c="dimmed">{t('logs.subtitle')}</Text>
        </div>
        <Group gap="xs">
          <Tooltip label={status}>
            <Badge
              color={statusColor}
              variant="dot"
              size="lg"
              leftSection={<StatusIcon size={14} />}
            >
              {status === 'connected' ? 'Live' : status === 'connecting' ? 'Connecting' : 'Offline'}
            </Badge>
          </Tooltip>
          <Button
            variant="default"
            leftSection={<Wifi size={16} />}
            onClick={() => setStreaming(!streaming)}
          >
            {streaming ? t('logs.autoRefreshOn') : t('logs.autoRefreshOff')}
          </Button>
          <Button variant="default" onClick={clearLogs}>
            {t('logs.clear', 'Clear')}
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
            <Stack gap={4}>
              {[...filteredLogs].reverse().map(log => (
                <Group
                  key={`${log.timestamp}-${log.level}-${log.message.substring(0, 50)}`}
                  gap="xs"
                  wrap="nowrap"
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    padding: '4px 8px',
                    borderBottom: '1px solid var(--mantine-color-default-border)',
                  }}
                >
                  <Text size="xs" c="dimmed" style={{ minWidth: '70px', flexShrink: 0 }}>
                    {formatTimestamp(log.timestamp)}
                  </Text>
                  {getLevelBadge(log.level)}
                  <Text size="xs" style={{ flex: 1, wordBreak: 'break-word', overflow: 'hidden' }}>
                    {log.message}
                  </Text>
                </Group>
              ))}
            </Stack>
          )}
        </Stack>
      </Paper>
    </Stack>
  )
}
