import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { API } from '@/config/api'
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
  const { id: urlConversationId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(
    urlConversationId
  )
  const [selectedModel, setSelectedModel] = useState<string | null>(() => {
    return localStorage.getItem('selectedModel')
  })
  const conversationRef = useRef<ConversationMessage[]>([])
  const streamingContentRef = useRef('')

  const saveConversation = useCallback(async () => {
    // Use conversationRef.current instead of messages state
    // because state updates are asynchronous and may not be applied yet
    const currentMessages = conversationRef.current

    if (currentMessages.length === 0) return

    const title = generateConversationTitle(
      currentMessages.map(msg => ({
        id: `msg-${Date.now()}`,
        role: msg.role,
        content: msg.content,
      }))
    )

    try {
      if (currentConversationId) {
        // Update existing conversation
        await updateConversation(currentConversationId, {
          messages: currentMessages.map(msg => ({
            id: `msg-${Date.now()}-${Math.random()}`,
            role: msg.role,
            content: msg.content,
          })),
          title,
        })
      } else {
        // Create new conversation
        const conversation = await createConversation({
          title,
          messages: currentMessages.map(msg => ({
            id: `msg-${Date.now()}-${Math.random()}`,
            role: msg.role,
            content: msg.content,
          })),
        })
        setCurrentConversationId(conversation.id)
        navigate(`/chat/${conversation.id}`, { replace: true })
      }
    } catch {
      // Silently fail - conversation saving is a convenience feature
    }
  }, [currentConversationId, navigate])

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
        await streamChatCompletion(
          conversationRef.current,
          {
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
          },
          selectedModel ?? undefined
        )
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
    [isStreaming, saveConversation, selectedModel]
  )

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0 || isStreaming) return

      setIsStreaming(true)

      try {
        // Upload files sequentially
        for (const file of files) {
          const formData = new FormData()
          formData.append('file', file)

          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 30000)

          const response = await fetch(API.sourcesImport(), {
            method: 'POST',
            body: formData,
            signal: controller.signal,
          })
          clearTimeout(timeoutId)

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Failed to upload ${file.name}: ${errorText}`)
          }
        }

        // Add a success message to the chat
        const successMsg: ChatMessage = {
          id: nextId(),
          role: 'assistant',
          content: `Successfully uploaded ${files.length} file${files.length > 1 ? 's' : ''}. Your documents have been added to the sources and can be used to generate style profiles.`,
        }
        setMessages(prev => [...prev, successMsg])
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)

        const errorMsg: ChatMessage = {
          id: nextId(),
          role: 'error',
          content: `File upload failed: ${errorMessage}`,
        }
        setMessages(prev => [...prev, errorMsg])
      } finally {
        setIsStreaming(false)
      }
    },
    [isStreaming]
  )

  const loadConversation = useCallback(
    (conversation: Conversation) => {
      setMessages(conversation.messages)
      setCurrentConversationId(conversation.id)
      conversationRef.current = conversation.messages
        .filter(msg => msg.role !== 'error')
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }))

      if (urlConversationId !== conversation.id) {
        navigate(`/chat/${conversation.id}`)
      }
    },
    [navigate, urlConversationId]
  )

  const startNewConversation = useCallback(() => {
    setMessages([])
    setCurrentConversationId(undefined)
    conversationRef.current = []
    navigate('/chat')
  }, [navigate])

  // Load conversation from URL on mount or URL change
  useEffect(() => {
    if (urlConversationId && urlConversationId !== currentConversationId) {
      import('@/services/conversation-api').then(({ fetchConversation }) => {
        fetchConversation(urlConversationId)
          .then(conversation => {
            loadConversation(conversation)
          })
          .catch(() => {
            navigate('/chat')
          })
      })
    }
  }, [urlConversationId, currentConversationId, loadConversation, navigate])

  const setModel = useCallback((modelId: string) => {
    setSelectedModel(modelId)
    localStorage.setItem('selectedModel', modelId)
  }, [])

  return {
    messages,
    isStreaming,
    sendMessage,
    uploadFiles,
    currentConversationId,
    loadConversation,
    startNewConversation,
    selectedModel,
    setModel,
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
