import { useCallback, useState } from 'react'
import { useChat } from '@/hooks/use-chat'
import { useHealthCheck } from '@/hooks/use-health-check'
import { ChatHeader } from './ChatHeader'
import { ChatInput } from './ChatInput'
import { ChatMessages } from './ChatMessages'
import { ConversationHistory } from './ConversationHistory'

export function ChatLayout() {
  const {
    messages,
    isStreaming,
    sendMessage,
    currentConversationId,
    loadConversation,
    startNewConversation,
    selectedModel,
    setModel,
  } = useChat()
  const { isConnected } = useHealthCheck()
  const [showHistory, setShowHistory] = useState(false)

  const handleDeleteConversation = useCallback(
    (deletedId: string) => {
      // If the deleted conversation is the current one, start a new conversation
      if (deletedId === currentConversationId) {
        startNewConversation()
      }
    },
    [currentConversationId, startNewConversation]
  )

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <ChatHeader
        isConnected={isConnected}
        selectedModel={selectedModel}
        onModelChange={setModel}
        onOpenHistory={() => setShowHistory(true)}
        onNewConversation={startNewConversation}
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
    </div>
  )
}
