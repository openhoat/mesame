import { ActionIcon, Text } from '@mantine/core'
import { Settings } from 'lucide-react'
import { StatusIndicator } from '@/components/StatusIndicator'

interface ChatHeaderProps {
  isConnected: boolean
  onNavigate: (page: string) => void
}

export function ChatHeader({ isConnected, onNavigate }: ChatHeaderProps) {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 20px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        flexShrink: 0,
      }}
    >
      <img
        src="./assets/MeSame_icon.png"
        alt="MeSame"
        style={{ width: '32px', height: '32px', borderRadius: '8px' }}
        onError={e => {
          e.currentTarget.style.display = 'none'
        }}
      />
      <Text size="lg" fw={600} c="white">
        MeSame
      </Text>
      <Text size="xs" c="dimmed" ml={8}>
        Your personal style proxy
      </Text>
      <div style={{ flex: 1 }} />
      <ActionIcon
        variant="subtle"
        onClick={() => onNavigate('dashboard')}
        title="Open Dashboard"
        size="lg"
      >
        <Settings size={20} />
      </ActionIcon>
      <StatusIndicator isConnected={isConnected} />
    </header>
  )
}
