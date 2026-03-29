import { ActionIcon, AppShell, Container, Group, NavLink, Text } from '@mantine/core'
import { Database, FileText, LayoutDashboard, Menu, MessageSquare, Settings, X } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface NavItem {
  labelKey: string
  icon: ReactNode
  id: string
}

const navItems: NavItem[] = [
  { labelKey: 'nav.chat', icon: <MessageSquare size={16} />, id: 'chat' },
  { labelKey: 'nav.dashboard', icon: <LayoutDashboard size={16} />, id: 'dashboard' },
  { labelKey: 'nav.sources', icon: <Database size={16} />, id: 'sources' },
  { labelKey: 'nav.profiles', icon: <FileText size={16} />, id: 'profiles' },
  { labelKey: 'nav.config', icon: <Settings size={16} />, id: 'config' },
]

export interface DashboardLayoutProps {
  currentPage: string
  onNavigate: (page: string) => void
  children: ReactNode
}

export function DashboardLayout({ currentPage, onNavigate, children }: DashboardLayoutProps) {
  const { t } = useTranslation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

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
              key={item.id}
              active={currentPage === item.id}
              label={sidebarOpen ? t(item.labelKey) : undefined}
              leftSection={item.icon}
              onClick={() => onNavigate(item.id)}
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
