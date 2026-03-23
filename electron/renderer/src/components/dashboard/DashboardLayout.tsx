import { ActionIcon, AppShell, Container, Group, NavLink, Text } from '@mantine/core'
import {
  BarChart3,
  FileText,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Settings,
  X,
} from 'lucide-react'
import { type ReactNode, useState } from 'react'

interface NavItem {
  label: string
  icon: ReactNode
  id: string
}

const navItems: NavItem[] = [
  { label: 'Chat', icon: <MessageSquare size={16} />, id: 'chat' },
  { label: 'Dashboard', icon: <LayoutDashboard size={16} />, id: 'dashboard' },
  { label: 'Style Profiles', icon: <FileText size={16} />, id: 'profiles' },
  { label: 'Request Logs', icon: <BarChart3 size={16} />, id: 'logs' },
  { label: 'Configuration', icon: <Settings size={16} />, id: 'config' },
]

export interface DashboardLayoutProps {
  currentPage: string
  onNavigate: (page: string) => void
  children: ReactNode
}

export function DashboardLayout({ currentPage, onNavigate, children }: DashboardLayoutProps) {
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
                MeSame
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
              label={sidebarOpen ? item.label : undefined}
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
