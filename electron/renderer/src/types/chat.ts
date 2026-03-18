export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'error'
  content: string
  isStreaming?: boolean
}
