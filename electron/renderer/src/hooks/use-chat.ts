import { useCallback, useRef, useState } from 'react'
import { streamChatCompletion } from '@/services/chat-api'
import type { ChatMessage, ConversationMessage } from '@/types/chat'

let messageIdCounter = 0

function nextId(): string {
  messageIdCounter += 1
  return `msg-${messageIdCounter}`
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const conversationRef = useRef<ConversationMessage[]>([])
  const streamingContentRef = useRef('')

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return

      const userMsg: ChatMessage = { id: nextId(), role: 'user', content: text }
      conversationRef.current.push({ role: 'user', content: text })

      const assistantId = nextId()
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        isStreaming: true,
      }

      setMessages(prev => [...prev, userMsg, assistantMsg])
      setIsStreaming(true)
      streamingContentRef.current = ''

      try {
        await streamChatCompletion(conversationRef.current, {
          onChunk(chunk) {
            streamingContentRef.current += chunk
            const content = streamingContentRef.current
            setMessages(prev => prev.map(m => (m.id === assistantId ? { ...m, content } : m)))
          },
          onError(error) {
            setMessages(prev => [
              ...prev.filter(m => m.id !== assistantId),
              { id: nextId(), role: 'error', content: error },
            ])
            conversationRef.current.pop()
          },
          onDone() {
            const finalContent = streamingContentRef.current
            if (finalContent) {
              conversationRef.current.push({ role: 'assistant', content: finalContent })
            }
            setMessages(prev =>
              prev.map(m => (m.id === assistantId ? { ...m, isStreaming: false } : m))
            )
          },
        })
      } catch (err) {
        const errorMessage =
          err instanceof Error && err.message === 'Failed to fetch'
            ? 'Cannot reach the server. Make sure MeSame is running.'
            : `Error: ${err instanceof Error ? err.message : String(err)}`

        setMessages(prev => [
          ...prev.filter(m => m.id !== assistantId),
          { id: nextId(), role: 'error', content: errorMessage },
        ])
        conversationRef.current.pop()
      } finally {
        setIsStreaming(false)
      }
    },
    [isStreaming]
  )

  return { messages, isStreaming, sendMessage }
}
