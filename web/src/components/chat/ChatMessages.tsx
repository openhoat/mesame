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
  onEditMessage?: (messageId: string, newContent: string) => void
  isStreaming?: boolean
}

export function ChatMessages({
  messages,
  checkpoints = [],
  onRestoreCheckpoint,
  onEditMessage,
  isStreaming,
}: ChatMessagesProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const el = containerRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  })

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-4 scrollbar-thin">
        <WelcomeScreen />
      </div>
    )
  }

  // Build a map of messageIndex -> checkpoint for quick lookup
  // checkpoint.messageIndex is the index after the user's question (before assistant's response)
  // So we display the checkpoint after the message at index (messageIndex - 1)
  const checkpointAfterIndex = new Map<number, Checkpoint>()
  for (const cp of checkpoints) {
    checkpointAfterIndex.set(cp.messageIndex - 1, cp)
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
        const checkpoint = checkpointAfterIndex.get(index)
        return (
          <div key={msg.id}>
            <ChatMessage message={msg} onEdit={onEditMessage} isStreaming={isStreaming} />
            {checkpoint && onRestoreCheckpoint && (
              <CheckpointMarker
                title={checkpoint.title}
                onRestore={() => onRestoreCheckpoint(checkpoint.id)}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
