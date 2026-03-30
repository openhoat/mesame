import type { ChatMessage } from '@/types/chat'

export interface Conversation {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

export interface CreateConversationData {
  title: string
  messages: ChatMessage[]
}

export interface UpdateConversationData {
  title?: string
  messages?: ChatMessage[]
}

export async function fetchConversations(): Promise<Conversation[]> {
  const response = await fetch('/v1/conversations')
  if (!response.ok) {
    throw new Error(`Failed to fetch conversations: ${response.statusText}`)
  }
  return response.json()
}

export async function fetchConversation(id: string): Promise<Conversation> {
  const response = await fetch(`/v1/conversations/${id}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch conversation: ${response.statusText}`)
  }
  return response.json()
}

export async function createConversation(data: CreateConversationData): Promise<Conversation> {
  const response = await fetch('/v1/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error(`Failed to create conversation: ${response.statusText}`)
  }
  return response.json()
}

export async function updateConversation(
  id: string,
  data: UpdateConversationData
): Promise<Conversation> {
  const response = await fetch(`/v1/conversations/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error(`Failed to update conversation: ${response.statusText}`)
  }
  return response.json()
}

export async function deleteConversation(id: string): Promise<void> {
  const response = await fetch(`/v1/conversations/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error(`Failed to delete conversation: ${response.statusText}`)
  }
}
