import { Badge, Divider, Grid, Group, Paper, Stack, Text, Title } from '@mantine/core'
import { Activity, FileText, TrendingUp, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface Stats {
  totalRequests: number
  activeProfiles: number
  avgResponseTime: number
  uptime: string
}

interface ActivityItem {
  time: string
  event: string
  model?: string
  status: 'success' | 'error'
}

function formatTimeAgo(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMins / 60)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${Math.floor(diffHours / 24)}d ago`
}

export function DashboardHome() {
  const { t } = useTranslation()
  const [stats, setStats] = useState<Stats>({
    totalRequests: 0,
    activeProfiles: 0,
    avgResponseTime: 0,
    uptime: '0h 0m',
  })
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])

  useEffect(() => {
    // Fetch stats from API
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats')
        if (response.ok) {
          const data = await response.json()
          setStats({
            totalRequests: data.totalRequests,
            activeProfiles: data.activeProfiles,
            avgResponseTime: data.avgResponseTime,
            uptime: data.uptime,
          })
          setRecentActivity(data.recentActivity || [])
        }
      } catch (_error) {
        // Failed to fetch stats - will retry on next interval
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 30000) // Refresh every 30s

    return () => clearInterval(interval)
  }, [])

  return (
    <Stack gap="lg">
      <div>
        <Title order={1}>{t('dashboard.title')}</Title>
        <Text c="dimmed">{t('dashboard.subtitle')}</Text>
      </div>

      {/* Stats Grid */}
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <Paper shadow="sm" p="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={500}>
                {t('dashboard.stats.totalRequests')}
              </Text>
              <Activity size={16} opacity={0.6} />
            </Group>
            <Text size="xl" fw={700}>
              {stats.totalRequests.toLocaleString()}
            </Text>
            <Text size="xs" c="dimmed">
              {t('dashboard.stats.totalRequestsChange')}
            </Text>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <Paper shadow="sm" p="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={500}>
                {t('dashboard.stats.activeProfiles')}
              </Text>
              <FileText size={16} opacity={0.6} />
            </Group>
            <Text size="xl" fw={700}>
              {stats.activeProfiles}
            </Text>
            <Text size="xs" c="dimmed">
              {t('dashboard.stats.activeProfilesDescription')}
            </Text>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <Paper shadow="sm" p="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={500}>
                {t('dashboard.stats.avgResponseTime')}
              </Text>
              <Zap size={16} opacity={0.6} />
            </Group>
            <Text size="xl" fw={700}>
              {stats.avgResponseTime}ms
            </Text>
            <Text size="xs" c="dimmed">
              {t('dashboard.stats.avgResponseTimeChange')}
            </Text>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <Paper shadow="sm" p="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={500}>
                {t('dashboard.stats.serverUptime')}
              </Text>
              <TrendingUp size={16} opacity={0.6} />
            </Group>
            <Text size="xl" fw={700}>
              {stats.uptime}
            </Text>
            <Text size="xs" c="dimmed">
              {t('dashboard.stats.uptimeStatus')}
            </Text>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Recent Activity */}
      <Paper shadow="sm" p="md" withBorder>
        <Stack gap="md">
          <div>
            <Title order={3}>{t('dashboard.recentActivity.title')}</Title>
            <Text size="sm" c="dimmed">
              {t('dashboard.recentActivity.subtitle')}
            </Text>
          </div>

          <Stack gap="md">
            {recentActivity.length === 0 ? (
              <Stack align="center" gap="md" py="xl">
                <Activity size={48} opacity={0.5} />
                <Text size="sm" c="dimmed">
                  {t('dashboard.recentActivity.noActivity')}
                </Text>
              </Stack>
            ) : (
              recentActivity.map((activity, index, arr) => (
                <div key={`${activity.time}-${activity.event}`}>
                  <Group justify="space-between">
                    <div>
                      <Text size="sm" fw={500}>
                        {activity.event}
                      </Text>
                      {activity.model && (
                        <Text size="xs" c="dimmed">
                          {activity.model}
                        </Text>
                      )}
                    </div>
                    <Group gap="xs">
                      <Text size="xs" c="dimmed">
                        {formatTimeAgo(activity.time)}
                      </Text>
                      <Badge color={activity.status === 'success' ? 'green' : 'red'}>
                        {activity.status}
                      </Badge>
                    </Group>
                  </Group>
                  {index < arr.length - 1 && <Divider my="sm" />}
                </div>
              ))
            )}
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  )
}
