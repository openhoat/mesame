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

export function DashboardHome() {
  const { t } = useTranslation()
  const [stats, setStats] = useState<Stats>({
    totalRequests: 0,
    activeProfiles: 0,
    avgResponseTime: 0,
    uptime: '0h 0m',
  })

  useEffect(() => {
    // Fetch stats from API
    const fetchStats = async () => {
      try {
        // TODO: Replace with actual API call
        setStats({
          totalRequests: 1247,
          activeProfiles: 3,
          avgResponseTime: 856,
          uptime: '24h 15m',
        })
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
            {[
              {
                time: '2 min ago',
                event: t('dashboard.recentActivity.chatCompletion'),
                model: 'gpt-4o-mini',
                status: 'success',
              },
              {
                time: '5 min ago',
                event: t('dashboard.recentActivity.styleProfileUpdated'),
                model: 'Technical Writer',
                status: 'success',
              },
              {
                time: '12 min ago',
                event: t('dashboard.recentActivity.chatCompletion'),
                model: 'gpt-4o',
                status: 'success',
              },
            ].map((activity, index, arr) => (
              <div key={`${activity.time}-${activity.event}`}>
                <Group justify="space-between">
                  <div>
                    <Text size="sm" fw={500}>
                      {activity.event}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {activity.model}
                    </Text>
                  </div>
                  <Group gap="xs">
                    <Text size="xs" c="dimmed">
                      {activity.time}
                    </Text>
                    <Badge color={activity.status === 'success' ? 'green' : 'red'}>
                      {activity.status}
                    </Badge>
                  </Group>
                </Group>
                {index < arr.length - 1 && <Divider my="sm" />}
              </div>
            ))}
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  )
}
