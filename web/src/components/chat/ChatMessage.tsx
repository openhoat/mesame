import { type KeyboardEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type { ChatMessage as ChatMessageType } from '@/types/chat'
import { StreamingCursor } from './StreamingCursor'

interface ChatMessageProps {
  message: ChatMessageType
  onEdit?: (messageId: string, newContent: string) => void
  isStreaming?: boolean
}

export function ChatMessage({ message, onEdit, isStreaming }: ChatMessageProps) {
  const { t } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const isUser = message.role === 'user'
  const isError = message.role === 'error'
  const canEdit = isUser && onEdit && !isStreaming

  const handleClick = () => {
    if (canEdit && !isEditing) {
      setIsEditing(true)
      setEditContent(message.content)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  const handleSave = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit?.(message.id, editContent.trim())
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditContent(message.content)
    setIsEditing(false)
  }

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
      {isEditing ? (
        <div className="message-content px-3 py-2 md:px-4 md:py-3 rounded-xl leading-relaxed text-sm whitespace-pre-wrap break-words bg-[hsl(var(--color-primary))]/10 border border-[hsl(var(--color-primary))]/30 rounded-tr-sm">
          <div className="flex flex-col gap-2">
            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full min-w-[200px] bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] rounded-md p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))]"
              rows={Math.min(5, Math.max(1, editContent.split('\n').length))}
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={handleCancel}
                className="px-2 py-1 text-xs rounded bg-[hsl(var(--color-muted))] hover:bg-[hsl(var(--color-muted))]/80"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-2 py-1 text-xs rounded bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-foreground))] hover:bg-[hsl(var(--color-primary))]/80"
              >
                {t('chat.send')}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          className={cn(
            'message-content px-3 py-2 md:px-4 md:py-3 rounded-xl leading-relaxed text-sm whitespace-pre-wrap break-words text-left',
            isUser &&
              'bg-[hsl(var(--color-primary))]/10 border border-[hsl(var(--color-primary))]/30 rounded-tr-sm',
            message.role === 'assistant' &&
              'bg-[hsl(var(--color-card))] border border-[hsl(var(--color-border))] rounded-tl-sm cursor-default',
            isError &&
              'bg-[hsl(var(--color-destructive))]/[0.15] border border-[hsl(var(--color-destructive))]/30 cursor-default',
            canEdit && 'cursor-pointer hover:bg-[hsl(var(--color-primary))]/15'
          )}
          disabled={!canEdit}
          title={canEdit ? 'Click to edit' : undefined}
        >
          {message.content}
          {message.isStreaming && <StreamingCursor />}
        </button>
      )}
    </article>
  )
}
