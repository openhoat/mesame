import { useChat } from '@/hooks/use-chat'
import { useHealthCheck } from '@/hooks/use-health-check'
import { ChatHeader } from './ChatHeader'
import { ChatInput } from './ChatInput'
import { ChatMessages } from './ChatMessages'

export function ChatLayout() {
  const { messages, isStreaming, sendMessage } = useChat()
  const { isConnected } = useHealthCheck()

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <ChatHeader isConnected={isConnected} />
      <ChatMessages messages={messages} />
      <ChatInput onSend={sendMessage} disabled={isStreaming} />
    </div>
  )
}
