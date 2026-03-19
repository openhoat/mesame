import { Activity, FileText, TrendingUp, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor your MeSame proxy server performance and usage
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from last hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Profiles</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProfiles}</div>
            <p className="text-xs text-muted-foreground">Style profiles configured</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">-23ms from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Server Uptime</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uptime}</div>
            <p className="text-xs text-muted-foreground">System running normally</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest requests and system events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
            ].map(activity => (
              <div
                key={`${activity.time}-${activity.event}`}
                className="flex items-center justify-between border-b pb-3 last:border-0"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">{activity.event}</p>
                  <p className="text-xs text-muted-foreground">{activity.model}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                  <Badge variant={activity.status === 'success' ? 'default' : 'destructive'}>
                    {activity.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
