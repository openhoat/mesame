import { cn } from '@/lib/utils'
import type { ChatMessage as ChatMessageType } from '@/types/chat'
import { StreamingCursor } from './StreamingCursor'

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const isError = message.role === 'error'

  return (
    <div
      className={cn(
        'message flex gap-3 max-w-[85%] animate-fade-in',
        isUser && 'user self-end flex-row-reverse',
        message.role === 'assistant' && 'assistant',
        isError && 'error'
      )}
    >
      <div
        className={cn(
          'w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-sm font-semibold',
          isUser && 'bg-white/[0.12] text-slate-300',
          message.role === 'assistant' &&
            'bg-gradient-to-br from-accent to-accent-secondary text-white',
          isError && 'bg-red-500/20 text-red-300'
        )}
      >
        {isUser ? 'U' : isError ? '!' : 'M'}
      </div>
      <div
        className={cn(
          'message-content px-4 py-3 rounded-xl leading-relaxed text-sm whitespace-pre-wrap break-words',
          isUser && 'bg-accent/20 border border-accent/30 rounded-tr-sm text-slate-200',
          message.role === 'assistant' &&
            'bg-white/[0.06] border border-white/[0.08] rounded-tl-sm',
          isError && 'bg-red-500/[0.15] border border-red-500/30 text-red-300'
        )}
      >
        {message.content}
        {message.isStreaming && <StreamingCursor />}
      </div>
    </div>
  )
}
