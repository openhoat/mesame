import type { FastifyPluginAsync } from 'fastify'
import {
  type ConversationData,
  type ConversationUpdate,
  createConversation,
  deleteConversation,
  getAllConversations,
  getConversationById,
  updateConversation,
} from '../services/conversationService.js'

interface ConversationParams {
  id: string
}

export const conversationsRoute: FastifyPluginAsync = async app => {
  // Create a conversation
  app.post<{ Body: ConversationData }>('/v1/conversations', async (request, reply) => {
    request.log.info('[Conversations API] Creating new conversation...')
    const { title, messages } = request.body

    if (!title) {
      request.log.warn('[Conversations API] Missing title')
      return reply.status(400).send({ error: 'title is required' })
    }

    if (!messages || !Array.isArray(messages)) {
      request.log.warn('[Conversations API] Missing or invalid messages')
      return reply.status(400).send({ error: 'messages array is required' })
    }

    try {
      const conversation = await createConversation({ title, messages })
      request.log.info(`[Conversations API] ✅ Conversation created: ${conversation.id}`)
      return reply.status(201).send(conversation)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      request.log.error(`[Conversations API] ❌ Failed to create conversation: ${errorMessage}`)
      throw error
    }
  })

  // List all conversations
  app.get('/v1/conversations', async request => {
    request.log.info('[Conversations API] Fetching all conversations...')
    try {
      const conversations = await getAllConversations()
      request.log.info(`[Conversations API] ✅ Found ${conversations.length} conversations`)
      return conversations
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      request.log.error(`[Conversations API] ❌ Failed to fetch conversations: ${errorMessage}`)
      throw error
    }
  })

  // Get a conversation by ID
  app.get<{ Params: ConversationParams }>('/v1/conversations/:id', async (request, reply) => {
    request.log.info(`[Conversations API] Fetching conversation: ${request.params.id}`)
    const conversation = await getConversationById(request.params.id)

    if (!conversation) {
      request.log.warn(`[Conversations API] Conversation not found: ${request.params.id}`)
      return reply.status(404).send({ error: 'Conversation not found' })
    }

    request.log.info(`[Conversations API] ✅ Conversation found: ${request.params.id}`)
    return conversation
  })

  // Update a conversation
  app.patch<{ Params: ConversationParams; Body: ConversationUpdate }>(
    '/v1/conversations/:id',
    async (request, reply) => {
      request.log.info(`[Conversations API] Updating conversation: ${request.params.id}`)
      const { title, messages } = request.body

      if (!title && !messages) {
        request.log.warn('[Conversations API] No fields to update')
        return reply
          .status(400)
          .send({ error: 'At least one field (title or messages) is required' })
      }

      if (messages && !Array.isArray(messages)) {
        request.log.warn('[Conversations API] Invalid messages format')
        return reply.status(400).send({ error: 'messages must be an array' })
      }

      try {
        const conversation = await updateConversation(request.params.id, {
          title,
          messages,
        })
        request.log.info(`[Conversations API] ✅ Conversation updated: ${conversation.id}`)
        return conversation
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        request.log.error(`[Conversations API] ❌ Failed to update conversation: ${errorMessage}`)
        throw error
      }
    }
  )

  // Delete a conversation
  app.delete<{ Params: ConversationParams }>('/v1/conversations/:id', async (request, reply) => {
    request.log.info(`[Conversations API] Deleting conversation: ${request.params.id}`)
    const conversation = await getConversationById(request.params.id)

    if (!conversation) {
      request.log.warn(`[Conversations API] Conversation not found: ${request.params.id}`)
      return reply.status(404).send({ error: 'Conversation not found' })
    }

    try {
      await deleteConversation(request.params.id)
      request.log.info(`[Conversations API] ✅ Conversation deleted: ${request.params.id}`)
      return reply.status(204).send()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      request.log.error(`[Conversations API] ❌ Failed to delete conversation: ${errorMessage}`)
      throw error
    }
  })

  // Export all conversations
  app.get('/v1/conversations/export', async request => {
    request.log.info('[Conversations API] Exporting all conversations...')
    try {
      const conversations = await getAllConversations()
      const exportData = {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        count: conversations.length,
        conversations,
      }
      request.log.info(`[Conversations API] ✅ Exported ${conversations.length} conversations`)
      return exportData
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      request.log.error(`[Conversations API] ❌ Failed to export conversations: ${errorMessage}`)
      throw error
    }
  })
}
