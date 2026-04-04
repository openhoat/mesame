import { ActionIcon, Group, Text } from '@mantine/core'
import { History, Keyboard, Plus, Settings } from 'lucide-react'
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
  onToggleShortcuts?: () => void
}

export const ChatHeader = ({
  isConnected,
  selectedModel,
  onModelChange,
  onOpenHistory,
  onNewConversation,
  onToggleShortcuts,
}: ChatHeaderProps) => {
  const { t } = useTranslation()
  return (
    <header className="flex items-center gap-3 md:gap-4 px-4 py-3 md:px-5 md:py-4 bg-black/30 border-b border-white/8 shrink-0">
      <img
        src="/app-images/MeSame_icon.png"
        alt={t('chat.header.appName')}
        className="w-8 h-8 rounded-lg"
        onError={e => {
          e.currentTarget.style.display = 'none'
        }}
      />
      <Text size="md" fw={600} c="white" className="hidden sm:block">
        {t('chat.header.appName')}
      </Text>
      <Text size="xs" c="dimmed" ml={4} className="hidden md:block">
        {t('chat.header.tagline')}
      </Text>
      <div className="flex-1" />
      <Group gap="xs">
        <ModelSelector
          value={selectedModel}
          onChange={onModelChange}
          placeholder={t('chat.selectModel') || 'Select model'}
          size="sm"
        />
        {onNewConversation && (
          <ActionIcon
            onClick={onNewConversation}
            variant="subtle"
            title="New conversation"
            aria-label={t('chat.header.newConversation') || 'New conversation'}
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
            aria-label={t('chat.header.conversationHistory') || 'Conversation history'}
            size="lg"
          >
            <History size={20} />
          </ActionIcon>
        )}
        {onToggleShortcuts && (
          <ActionIcon
            onClick={onToggleShortcuts}
            variant="subtle"
            title={t('chat.shortcuts.showHelp')}
            aria-label={t('chat.shortcuts.showHelp')}
            size="lg"
            className="hidden sm:flex"
          >
            <Keyboard size={20} />
          </ActionIcon>
        )}
        <ActionIcon
          component={Link}
          to="/dashboard"
          variant="subtle"
          data-testid="open-dashboard"
          title={t('chat.header.openDashboard')}
          aria-label={t('chat.header.openDashboard') || 'Open dashboard'}
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