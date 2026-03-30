import { useCallback, useRef, useState } from 'react'
import { streamChatCompletion } from '@/services/chat-api'
import {
  type Conversation,
  createConversation,
  updateConversation,
} from '@/services/conversation-api'
import type { ChatMessage, ConversationMessage } from '@/types/chat'

let messageIdCounter = 0

function nextId(): string {
  messageIdCounter += 1
  return `msg-${messageIdCounter}`
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>()
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

            // Auto-save conversation after each assistant response
            saveConversation()
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isStreaming]
  )

  const saveConversation = useCallback(async () => {
    const currentMessages = messages.filter(msg => msg.role !== 'error' && !msg.isStreaming)

    if (currentMessages.length === 0) return

    const title = generateConversationTitle(currentMessages)

    try {
      if (currentConversationId) {
        // Update existing conversation
        await updateConversation(currentConversationId, {
          messages: currentMessages,
          title,
        })
      } else {
        // Create new conversation
        const conversation = await createConversation({
          title,
          messages: currentMessages,
        })
        setCurrentConversationId(conversation.id)
      }
    } catch {
      // Silently fail - conversation saving is a convenience feature
    }
  }, [messages, currentConversationId])

  const loadConversation = useCallback((conversation: Conversation) => {
    setMessages(conversation.messages)
    setCurrentConversationId(conversation.id)
    conversationRef.current = conversation.messages
      .filter(msg => msg.role !== 'error')
      .map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }))
  }, [])

  const startNewConversation = useCallback(() => {
    setMessages([])
    setCurrentConversationId(undefined)
    conversationRef.current = []
  }, [])

  return {
    messages,
    isStreaming,
    sendMessage,
    currentConversationId,
    loadConversation,
    startNewConversation,
  }
}

function generateConversationTitle(messages: ChatMessage[]): string {
  const firstUserMessage = messages.find(msg => msg.role === 'user')
  if (!firstUserMessage) return 'New conversation'

  const content = firstUserMessage.content.trim()
  const maxLength = 50
  if (content.length <= maxLength) return content

  return `${content.slice(0, maxLength)}...`
}
