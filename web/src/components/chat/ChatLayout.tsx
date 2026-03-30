import { useState } from 'react'
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
  } = useChat()
  const { isConnected } = useHealthCheck()
  const [showHistory, setShowHistory] = useState(false)

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <ChatHeader
        isConnected={isConnected}
        onOpenHistory={() => setShowHistory(true)}
        onNewConversation={startNewConversation}
      />
      <ChatMessages messages={messages} />
      <ChatInput onSend={sendMessage} disabled={isStreaming} />

      {showHistory && (
        <ConversationHistory
          onSelect={loadConversation}
          onClose={() => setShowHistory(false)}
          currentConversationId={currentConversationId}
        />
      )}
    </div>
  )
}
