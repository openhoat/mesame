import { useCallback, useEffect, useState } from 'react'
import {
  type Conversation,
  deleteConversation,
  downloadConversationsAsJson,
  exportConversations,
  fetchConversations,
} from '@/services/conversation-api'

interface ConversationHistoryProps {
  onSelect: (conversation: Conversation) => void
  onClose: () => void
  currentConversationId?: string
}

export function ConversationHistory({
  onSelect,
  onClose,
  currentConversationId,
}: ConversationHistoryProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchConversations()
      setConversations(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  async function handleDelete(id: string, event: React.MouseEvent) {
    event.stopPropagation()
    if (!window.confirm('Delete this conversation?')) return

    try {
      await deleteConversation(id)
      setConversations(prev => prev.filter(conv => conv.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete conversation')
    }
  }

  async function handleExport() {
    try {
      setError(null)
      const data = await exportConversations()
      downloadConversationsAsJson(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export conversations')
    }
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
    if (diffDays === 1) {
      return 'Yesterday'
    }
    if (diffDays < 7) {
      return `${diffDays} days ago`
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex">
      <div className="bg-white dark:bg-gray-900 w-80 h-full shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Conversation History
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Export conversations"
              title="Export all conversations as JSON"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-label="Download icon"
              >
                <title>Export</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Close conversation history"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-label="Close icon"
              >
                <title>Close</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="text-center text-gray-500 dark:text-gray-400">Loading...</div>
          )}
          {error && (
            <div className="text-center text-red-500 dark:text-red-400 text-sm">{error}</div>
          )}
          {!loading && !error && conversations.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
              No saved conversations yet
            </div>
          )}
          {!loading && conversations.length > 0 && (
            <div className="space-y-2">
              {conversations.map(conv => (
                <button
                  type="button"
                  key={conv.id}
                  onClick={() => {
                    onSelect(conv)
                    onClose()
                  }}
                  className={`w-full text-left p-3 rounded-lg cursor-pointer transition-colors ${
                    conv.id === currentConversationId
                      ? 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700'
                      : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                  } border border-gray-200 dark:border-gray-700 group`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {conv.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {conv.messages.length} messages • {formatDate(conv.updatedAt)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={e => handleDelete(conv.id, e)}
                      className="ml-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Delete conversation"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        role="img"
                        aria-label="Delete icon"
                      >
                        <title>Delete</title>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Backdrop to close sidebar */}
      <button
        type="button"
        className="flex-1"
        onClick={onClose}
        aria-label="Close conversation history"
      />
    </div>
  )
}
