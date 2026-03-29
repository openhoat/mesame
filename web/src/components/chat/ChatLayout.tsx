import { useChat } from '@/hooks/use-chat'
import { useHealthCheck } from '@/hooks/use-health-check'
import { ChatHeader } from './ChatHeader'
import { ChatInput } from './ChatInput'
import { ChatMessages } from './ChatMessages'

export interface ChatLayoutProps {
  onNavigate: (page: string) => void
}

export function ChatLayout({ onNavigate }: ChatLayoutProps) {
  const { messages, isStreaming, sendMessage } = useChat()
  const { isConnected } = useHealthCheck()

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <ChatHeader isConnected={isConnected} onNavigate={onNavigate} />
      <ChatMessages messages={messages} />
      <ChatInput onSend={sendMessage} disabled={isStreaming} />
    </div>
  )
}
