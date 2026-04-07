import { API } from '@/config/api'

export interface Checkpoint {
  id: string
  conversationId: string
  messageIndex: number
  title: string
  createdAt: string
}

export interface RestoreResult {
  conversation: { id: string; messages: unknown[] }
  checkpoint: Checkpoint
}

export const fetchCheckpoints = async (conversationId: string): Promise<Checkpoint[]> => {
  const response = await fetch(API.checkpoints(conversationId))
  if (!response.ok) {
    throw new Error(`Failed to fetch checkpoints: ${response.statusText}`)
  }
  return response.json()
}

export const createCheckpoint = async (
  conversationId: string,
  messageIndex: number,
  title: string
): Promise<Checkpoint> => {
  const response = await fetch(API.checkpoints(conversationId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messageIndex, title }),
  })
  if (!response.ok) {
    throw new Error(`Failed to create checkpoint: ${response.statusText}`)
  }
  return response.json()
}

export const restoreCheckpoint = async (
  conversationId: string,
  checkpointId: string
): Promise<RestoreResult> => {
  const response = await fetch(API.checkpointRestore(conversationId, checkpointId), {
    method: 'POST',
  })
  if (!response.ok) {
    throw new Error(`Failed to restore checkpoint: ${response.statusText}`)
  }
  return response.json()
}

export const deleteCheckpoint = async (
  conversationId: string,
  checkpointId: string
): Promise<void> => {
  const response = await fetch(API.checkpointById(conversationId, checkpointId), {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error(`Failed to delete checkpoint: ${response.statusText}`)
  }
}
