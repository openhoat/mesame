import { ActionIcon, AppShell, Container, Group, NavLink, Text } from '@mantine/core'
import { Database, FileText, LayoutDashboard, Menu, MessageSquare, Settings, X } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'

interface NavItem {
  labelKey: string
  icon: ReactNode
  path: string
}

const navItems: NavItem[] = [
  { labelKey: 'nav.chat', icon: <MessageSquare size={16} />, path: '/' },
  { labelKey: 'nav.dashboard', icon: <LayoutDashboard size={16} />, path: '/dashboard' },
  { labelKey: 'nav.sources', icon: <Database size={16} />, path: '/dashboard/sources' },
  { labelKey: 'nav.profiles', icon: <FileText size={16} />, path: '/dashboard/profiles' },
  { labelKey: 'nav.config', icon: <Settings size={16} />, path: '/dashboard/config' },
]

export interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { t } = useTranslation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()

  return (
    <AppShell
      navbar={{
        width: sidebarOpen ? 250 : 80,
        breakpoint: 'sm',
      }}
      padding="md"
    >
      <AppShell.Navbar p="md">
        {/* Logo & Toggle */}
        <AppShell.Section>
          <Group justify="space-between" mb="md">
            {sidebarOpen && (
              <Text fw={700} size="lg">
                {t('common.appName')}
              </Text>
            )}
            <ActionIcon
              onClick={() => setSidebarOpen(!sidebarOpen)}
              variant="subtle"
              style={{
                marginLeft: sidebarOpen ? 0 : 'auto',
                marginRight: sidebarOpen ? 0 : 'auto',
              }}
            >
              {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
            </ActionIcon>
          </Group>
        </AppShell.Section>

        {/* Navigation */}
        <AppShell.Section grow>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              data-testid={`nav-${item.path.replace('/', '').replace('/', '-')}`}
              component={Link}
              to={item.path}
              active={location.pathname === item.path}
              label={sidebarOpen ? t(item.labelKey) : undefined}
              leftSection={item.icon}
              style={{ borderRadius: 'var(--mantine-radius-default)' }}
            />
          ))}
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Container size="xl" p="md">
          {children}
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}
