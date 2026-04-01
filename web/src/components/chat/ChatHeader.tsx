import { ActionIcon, Group, Text } from '@mantine/core'
import { History, Plus, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ModelSelector } from '@/components/ModelSelector'
import { StatusIndicator } from '@/components/StatusIndicator'
import { ThemeToggle } from '@/components/ThemeToggle'

interface ChatHeaderProps {
  isConnected: boolean
  selectedModel: string | null
  onModelChange: (modelId: string) => void
  onOpenHistory?: () => void
  onNewConversation?: () => void
}

export function ChatHeader({
  isConnected,
  selectedModel,
  onModelChange,
  onOpenHistory,
  onNewConversation,
}: ChatHeaderProps) {
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
        src="/app-images/MeSame_icon.png"
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
      <Group gap="xs">
        <ModelSelector
          value={selectedModel}
          onChange={onModelChange}
          placeholder={t('chat.selectModel') || 'Select model'}
          size="xs"
        />
        {onNewConversation && (
          <ActionIcon
            onClick={onNewConversation}
            variant="subtle"
            title="New conversation"
            size="lg"
          >
            <Plus size={20} />
          </ActionIcon>
        )}
        {onOpenHistory && (
          <ActionIcon
            onClick={onOpenHistory}
            variant="subtle"
            title="Conversation history"
            size="lg"
          >
            <History size={20} />
          </ActionIcon>
        )}
        <ActionIcon
          component={Link}
          to="/dashboard"
          variant="subtle"
          data-testid="open-dashboard"
          title={t('chat.header.openDashboard')}
          size="lg"
        >
          <Settings size={20} />
        </ActionIcon>
        <ThemeToggle variant="menu" />
        <StatusIndicator isConnected={isConnected} />
      </Group>
    </header>
  )
}
