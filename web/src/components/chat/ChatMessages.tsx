import { useEffect, useRef } from 'react'
import type { ChatMessage as ChatMessageType } from '@/types/chat'
import { ChatMessage } from './ChatMessage'
import { WelcomeScreen } from './WelcomeScreen'

interface ChatMessagesProps {
  messages: ChatMessageType[]
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const lastMessage = messages[messages.length - 1]
  const _scrollTrigger = lastMessage ? `${lastMessage.id}-${lastMessage.content.length}` : ''

  useEffect(() => {
    const el = containerRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [])

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 scrollbar-thin">
        <WelcomeScreen />
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 scroll-smooth scrollbar-thin"
    >
      {messages.map(msg => (
        <ChatMessage key={msg.id} message={msg} />
      ))}
    </div>
  )
}
