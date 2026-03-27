import { ActionIcon, Text } from '@mantine/core'
import { Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { StatusIndicator } from '@/components/StatusIndicator'

interface ChatHeaderProps {
  isConnected: boolean
  onNavigate: (page: string) => void
}

export function ChatHeader({ isConnected, onNavigate }: ChatHeaderProps) {
  const { t } = useTranslation()
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
        alt={t('chat.header.appName')}
        style={{ width: '32px', height: '32px', borderRadius: '8px' }}
        onError={e => {
          e.currentTarget.style.display = 'none'
        }}
      />
      <Text size="lg" fw={600} c="white">
        {t('chat.header.appName')}
      </Text>
      <Text size="xs" c="dimmed" ml={8}>
        {t('chat.header.tagline')}
      </Text>
      <div style={{ flex: 1 }} />
      <ActionIcon
        variant="subtle"
        onClick={() => onNavigate('dashboard')}
        title={t('chat.header.openDashboard')}
        size="lg"
      >
        <Settings size={20} />
      </ActionIcon>
      <StatusIndicator isConnected={isConnected} />
    </header>
  )
}
