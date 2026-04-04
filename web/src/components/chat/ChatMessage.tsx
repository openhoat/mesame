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
    <article
      aria-label={isUser ? 'User message' : isError ? 'Error message' : 'Assistant message'}
      data-role={message.role}
      className={cn(
        'message flex gap-2 md:gap-3 max-w-[90%] md:max-w-[85%] animate-fade-in',
        isUser && 'user self-end flex-row-reverse',
        message.role === 'assistant' && 'assistant',
        isError && 'error'
      )}
    >
      <div
        className={cn(
          'w-7 h-7 md:w-8 md:h-8 rounded-lg shrink-0 flex items-center justify-center text-sm font-semibold',
          isUser &&
            'bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-foreground))] dark:bg-white/[0.12] dark:text-slate-300',
          message.role === 'assistant' &&
            'bg-gradient-to-br from-accent to-accent-secondary text-white',
          isError &&
            'bg-[hsl(var(--color-destructive))]/20 text-[hsl(var(--color-destructive-foreground))]'
        )}
      >
        {isUser ? 'U' : isError ? '!' : 'M'}
      </div>
      <div
        className={cn(
          'message-content px-3 py-2 md:px-4 md:py-3 rounded-xl leading-relaxed text-sm whitespace-pre-wrap break-words',
          isUser &&
            'bg-[hsl(var(--color-primary))]/10 border border-[hsl(var(--color-primary))]/30 rounded-tr-sm',
          message.role === 'assistant' &&
            'bg-[hsl(var(--color-card))] border border-[hsl(var(--color-border))] rounded-tl-sm',
          isError &&
            'bg-[hsl(var(--color-destructive))]/[0.15] border border-[hsl(var(--color-destructive))]/30'
        )}
      >
        {message.content}
        {message.isStreaming && <StreamingCursor />}
      </div>
    </article>
  )
}
