import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FileDropZone } from '@/components/FileDropZone'
import { useChat } from '@/hooks/use-chat'
import { useHealthCheck } from '@/hooks/use-health-check'
import { type KeyboardShortcut, useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { ChatHeader } from './ChatHeader'
import { ChatInput } from './ChatInput'
import { ChatMessages } from './ChatMessages'
import { ConversationHistory } from './ConversationHistory'
import { KeyboardShortcutsDialog } from './KeyboardShortcutsDialog'

export const ChatLayout = () => {
  const { t } = useTranslation()
  const {
    messages,
    isStreaming,
    sendMessage,
    currentConversationId,
    loadConversation,
    startNewConversation,
    selectedModel,
    setModel,
    uploadFiles,
  } = useChat()
  const { isConnected } = useHealthCheck()
  const [showHistory, setShowHistory] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)

  const handleDeleteConversation = useCallback(
    (deletedId: string) => {
      // If the deleted conversation is the current one, start a new conversation
      if (deletedId === currentConversationId) {
        startNewConversation()
      }
    },
    [currentConversationId, startNewConversation]
  )

  const handleFilesDropped = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return
      await uploadFiles(files)
    },
    [uploadFiles]
  )

  const focusInput = useCallback(() => {
    const textarea = document.getElementById('input')
    if (textarea instanceof HTMLTextAreaElement) {
      textarea.focus()
    }
  }, [])

  const handleCloseAll = useCallback(() => {
    if (showShortcuts) {
      setShowShortcuts(false)
    } else if (showHistory) {
      setShowHistory(false)
    }
  }, [showHistory, showShortcuts])

  const toggleShortcuts = useCallback(() => {
    setShowShortcuts(prev => !prev)
  }, [])

  const toggleHistory = useCallback(() => {
    setShowHistory(prev => !prev)
  }, [])

  const shortcuts: KeyboardShortcut[] = useMemo(
    () => [
      {
        key: '/',
        ctrl: true,
        description: t('chat.shortcuts.showHelp'),
        action: toggleShortcuts,
      },
      {
        key: 'n',
        ctrl: true,
        description: t('chat.shortcuts.newConversation'),
        action: startNewConversation,
      },
      {
        key: 'h',
        ctrl: true,
        shift: true,
        description: t('chat.shortcuts.toggleHistory'),
        action: toggleHistory,
      },
      {
        key: 'i',
        ctrl: true,
        description: t('chat.shortcuts.focusInput'),
        action: focusInput,
      },
      {
        key: 'Escape',
        description: t('chat.shortcuts.closePanel'),
        action: handleCloseAll,
      },
    ],
    [t, toggleShortcuts, startNewConversation, toggleHistory, focusInput, handleCloseAll]
  )

  // Disable global shortcuts when a dialog is open (except Escape which is handled locally)
  useKeyboardShortcuts(shortcuts, !showShortcuts)

  return (
    <FileDropZone
      onDrop={handleFilesDropped}
      accept=".txt,.md,.pdf,text/plain,text/markdown,application/pdf"
      disabled={isStreaming}
    >
      <main className="flex flex-col h-dvh overflow-hidden">
        <ChatHeader
          isConnected={isConnected}
          selectedModel={selectedModel}
          onModelChange={setModel}
          onOpenHistory={() => setShowHistory(true)}
          onNewConversation={startNewConversation}
          onToggleShortcuts={toggleShortcuts}
        />
        <ChatMessages messages={messages} />
        <ChatInput onSend={sendMessage} disabled={isStreaming} />

        {showHistory && (
          <ConversationHistory
            onSelect={loadConversation}
            onClose={() => setShowHistory(false)}
            onDelete={handleDeleteConversation}
            currentConversationId={currentConversationId}
          />
        )}

        {showShortcuts && (
          <KeyboardShortcutsDialog shortcuts={shortcuts} onClose={() => setShowShortcuts(false)} />
        )}
      </main>
    </FileDropZone>
  )
}