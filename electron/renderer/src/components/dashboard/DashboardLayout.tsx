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
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  icon: ReactNode
  id: string
}

const navItems: NavItem[] = [
  { label: 'Chat', icon: <MessageSquare className="h-4 w-4" />, id: 'chat' },
  { label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, id: 'dashboard' },
  { label: 'Style Profiles', icon: <FileText className="h-4 w-4" />, id: 'profiles' },
  { label: 'Request Logs', icon: <BarChart3 className="h-4 w-4" />, id: 'logs' },
  { label: 'Configuration', icon: <Settings className="h-4 w-4" />, id: 'config' },
]

export interface DashboardLayoutProps {
  currentPage: string
  onNavigate: (page: string) => void
  children: ReactNode
}

export function DashboardLayout({ currentPage, onNavigate, children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col border-r bg-card transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-16'
        )}
      >
        {/* Logo & Toggle */}
        <div className="flex h-14 items-center justify-between border-b px-4">
          {sidebarOpen && <span className="text-lg font-bold">MeSame</span>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn(!sidebarOpen && 'mx-auto')}
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2">
          {navItems.map(item => (
            <button
              type="button"
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                currentPage === item.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  )
}
