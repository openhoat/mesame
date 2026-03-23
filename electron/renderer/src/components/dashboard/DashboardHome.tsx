import { Badge, Divider, Grid, Group, Paper, Stack, Text, Title } from '@mantine/core'
import { Activity, FileText, TrendingUp, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Stats {
  totalRequests: number
  activeProfiles: number
  avgResponseTime: number
  uptime: string
}

export function DashboardHome() {
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
        <Title order={1}>Dashboard</Title>
        <Text c="dimmed">Monitor your MeSame proxy server performance and usage</Text>
      </div>

      {/* Stats Grid */}
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <Paper shadow="sm" p="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={500}>
                Total Requests
              </Text>
              <Activity size={16} opacity={0.6} />
            </Group>
            <Text size="xl" fw={700}>
              {stats.totalRequests.toLocaleString()}
            </Text>
            <Text size="xs" c="dimmed">
              +12% from last hour
            </Text>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <Paper shadow="sm" p="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={500}>
                Active Profiles
              </Text>
              <FileText size={16} opacity={0.6} />
            </Group>
            <Text size="xl" fw={700}>
              {stats.activeProfiles}
            </Text>
            <Text size="xs" c="dimmed">
              Style profiles configured
            </Text>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <Paper shadow="sm" p="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={500}>
                Avg Response Time
              </Text>
              <Zap size={16} opacity={0.6} />
            </Group>
            <Text size="xl" fw={700}>
              {stats.avgResponseTime}ms
            </Text>
            <Text size="xs" c="dimmed">
              -23ms from yesterday
            </Text>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <Paper shadow="sm" p="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={500}>
                Server Uptime
              </Text>
              <TrendingUp size={16} opacity={0.6} />
            </Group>
            <Text size="xl" fw={700}>
              {stats.uptime}
            </Text>
            <Text size="xs" c="dimmed">
              System running normally
            </Text>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Recent Activity */}
      <Paper shadow="sm" p="md" withBorder>
        <Stack gap="md">
          <div>
            <Title order={3}>Recent Activity</Title>
            <Text size="sm" c="dimmed">
              Latest requests and system events
            </Text>
          </div>

          <Stack gap="md">
            {[
              {
                time: '2 min ago',
                event: 'Chat completion',
                model: 'gpt-4o-mini',
                status: 'success',
              },
              {
                time: '5 min ago',
                event: 'Style profile updated',
                model: 'Technical Writer',
                status: 'success',
              },
              {
                time: '12 min ago',
                event: 'Chat completion',
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
