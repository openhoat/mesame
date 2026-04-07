import { useEffect, useRef } from 'react'
import type { Checkpoint } from '@/services/checkpoint-api'
import type { ChatMessage as ChatMessageType } from '@/types/chat'
import { ChatMessage } from './ChatMessage'
import { CheckpointMarker } from './CheckpointMarker'
import { WelcomeScreen } from './WelcomeScreen'

interface ChatMessagesProps {
  messages: ChatMessageType[]
  checkpoints?: Checkpoint[]
  onRestoreCheckpoint?: (checkpointId: string) => void
}

export function ChatMessages({
  messages,
  checkpoints = [],
  onRestoreCheckpoint,
}: ChatMessagesProps) {
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
      <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-4 scrollbar-thin">
        <WelcomeScreen />
      </div>
    )
  }

  // Build a map of messageIndex -> checkpoint for quick lookup
  const checkpointByIndex = new Map<number, Checkpoint>()
  for (const cp of checkpoints) {
    checkpointByIndex.set(cp.messageIndex, cp)
  }

  return (
    <div
      ref={containerRef}
      role="log"
      aria-live="polite"
      aria-label="Chat messages"
      className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-3 md:gap-4 scroll-smooth scrollbar-thin"
    >
      {messages.map((msg, index) => {
        const checkpoint = checkpointByIndex.get(index)
        return (
          <div key={msg.id}>
            {checkpoint && onRestoreCheckpoint && (
              <CheckpointMarker
                title={checkpoint.title}
                onRestore={() => onRestoreCheckpoint(checkpoint.id)}
              />
            )}
            <ChatMessage message={msg} />
          </div>
        )
      })}
    </div>
  )
}
