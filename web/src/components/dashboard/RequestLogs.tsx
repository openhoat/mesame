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
