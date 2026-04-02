import { ActionIcon, AppShell, Burger, Container, Group, NavLink, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  Activity,
  Database,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Server,
  Settings,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { ThemeToggle } from '@/components/ThemeToggle'

interface NavItem {
  labelKey: string
  icon: ReactNode
  path: string
}

const navItems: NavItem[] = [
  { labelKey: 'nav.chat', icon: <MessageSquare size={16} />, path: '/' },
  { labelKey: 'nav.dashboard', icon: <LayoutDashboard size={16} />, path: '/dashboard' },
  { labelKey: 'nav.providers', icon: <Server size={16} />, path: '/dashboard/providers' },
  { labelKey: 'nav.sources', icon: <Database size={16} />, path: '/dashboard/sources' },
  { labelKey: 'nav.profiles', icon: <FileText size={16} />, path: '/dashboard/profiles' },
  { labelKey: 'nav.logs', icon: <Activity size={16} />, path: '/dashboard/logs' },
  { labelKey: 'nav.config', icon: <Settings size={16} />, path: '/dashboard/config' },
]

export interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { t } = useTranslation()
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure(false)
  const [desktopCollapsed, { toggle: toggleDesktop }] = useDisclosure(false)
  const location = useLocation()

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: desktopCollapsed ? 80 : 280,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened },
      }}
      padding={{ base: 'sm', md: 'md' }}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
          <Text fw={700} size="lg" className="hidden sm:block">
            {t('common.appName')}
          </Text>
          <Group>
            <ActionIcon onClick={toggleDesktop} variant="subtle" size="lg" hiddenFrom="sm">
              {desktopCollapsed ? 'Expand' : 'Collapse'}
            </ActionIcon>
            <ThemeToggle variant="menu" />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section grow>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              data-testid={`nav-${item.path.replace('/', '').replace('/', '-')}`}
              component={Link}
              to={item.path}
              active={location.pathname === item.path}
              label={!desktopCollapsed || mobileOpened ? t(item.labelKey) : undefined}
              leftSection={item.icon}
              onClick={() => toggleMobile()}
              style={{ borderRadius: 'var(--mantine-radius-default)', minHeight: '44px' }}
            />
          ))}
        </AppShell.Section>

        <AppShell.Section>
          <Group justify={!desktopCollapsed || mobileOpened ? 'flex-end' : 'center'}>
            <ThemeToggle variant="menu" />
          </Group>
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
