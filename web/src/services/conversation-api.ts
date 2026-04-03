import { API } from '@/config/api'
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
  const response = await fetch(API.conversations())
  if (!response.ok) {
    throw new Error(`Failed to fetch conversations: ${response.statusText}`)
  }
  return response.json()
}

export async function fetchConversation(id: string): Promise<Conversation> {
  const response = await fetch(API.conversationById(id))
  if (!response.ok) {
    throw new Error(`Failed to fetch conversation: ${response.statusText}`)
  }
  return response.json()
}

export async function createConversation(data: CreateConversationData): Promise<Conversation> {
  const response = await fetch(API.conversations(), {
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
  const response = await fetch(API.conversationById(id), {
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
  const response = await fetch(API.conversationById(id), {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error(`Failed to delete conversation: ${response.statusText}`)
  }
}

export interface ExportData {
  exportedAt: string
  version: string
  count: number
  conversations: Conversation[]
}

export async function exportConversations(): Promise<ExportData> {
  const response = await fetch(API.conversationsExport())
  if (!response.ok) {
    throw new Error(`Failed to export conversations: ${response.statusText}`)
  }
  return response.json()
}

export function downloadConversationsAsJson(data: ExportData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `conversations-export-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function convertConversationToSource(
  id: string
): Promise<{ id: string; title: string }> {
  const response = await fetch(API.conversationToSource(id), {
    method: 'POST',
  })
  if (!response.ok) {
    throw new Error(`Failed to convert conversation to source: ${response.statusText}`)
  }
  return response.json()
}
