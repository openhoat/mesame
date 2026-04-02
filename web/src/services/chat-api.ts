import { API } from '@/config/api'
import type { ConversationMessage } from '@/types/chat'

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(API.health())
    return res.ok
  } catch {
    return false
  }
}

export interface StreamCallbacks {
  onChunk: (text: string) => void
  onError: (error: string) => void
  onDone: () => void
}

export async function streamChatCompletion(
  messages: ConversationMessage[],
  callbacks: StreamCallbacks,
  model?: string
): Promise<void> {
  const response = await fetch(API.chatCompletions(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      stream: true,
      ...(model ? { model } : {}),
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    callbacks.onError(`Error ${response.status}: ${errorText || response.statusText}`)
    return
  }

  const reader = response.body?.getReader()
  if (!reader) {
    callbacks.onError('No response body')
    return
  }

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed?.startsWith('data: ')) continue

      const data = trimmed.slice(6)
      if (data === '[DONE]') continue

      try {
        const parsed = JSON.parse(data)
        const delta = parsed.choices?.[0]?.delta?.content
        if (delta) {
          callbacks.onChunk(delta)
        }
      } catch {
        // Skip malformed JSON chunks
      }
    }
  }

  callbacks.onDone()
}
