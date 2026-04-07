import type { FastifyPluginAsync } from 'fastify'
import {
  type CheckpointData,
  createCheckpoint,
  deleteCheckpoint,
  getCheckpointsByConversation,
  restoreCheckpoint,
} from '../services/checkpointService.js'
import { getConversationById } from '../services/conversationService.js'

interface ConversationParams {
  id: string
}

interface CheckpointParams {
  id: string
  checkpointId: string
}

interface CreateCheckpointBody {
  messageIndex: number
  title: string
}

export const checkpointsRoute: FastifyPluginAsync = async app => {
  // Create a checkpoint for a conversation
  app.post<{ Params: ConversationParams; Body: CreateCheckpointBody }>(
    '/v1/conversations/:id/checkpoints',
    async (request, reply) => {
      const { id } = request.params
      const { messageIndex, title } = request.body

      if (messageIndex === undefined || !title) {
        return reply.status(400).send({ error: 'messageIndex and title are required' })
      }

      const conversation = await getConversationById(id)
      if (!conversation) {
        return reply.status(404).send({ error: 'Conversation not found' })
      }

      if (messageIndex < 0 || messageIndex > conversation.messages.length) {
        return reply.status(400).send({ error: 'messageIndex out of range' })
      }

      try {
        const data: CheckpointData = { conversationId: id, messageIndex, title }
        const checkpoint = await createCheckpoint(data)
        return reply.status(201).send(checkpoint)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        request.log.error(`Failed to create checkpoint: ${errorMessage}`)
        throw error
      }
    }
  )

  // List checkpoints for a conversation
  app.get<{ Params: ConversationParams }>(
    '/v1/conversations/:id/checkpoints',
    async (request, reply) => {
      const { id } = request.params

      const conversation = await getConversationById(id)
      if (!conversation) {
        return reply.status(404).send({ error: 'Conversation not found' })
      }

      try {
        const checkpoints = await getCheckpointsByConversation(id)
        return checkpoints
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        request.log.error(`Failed to fetch checkpoints: ${errorMessage}`)
        throw error
      }
    }
  )

  // Restore a checkpoint
  app.post<{ Params: CheckpointParams }>(
    '/v1/conversations/:id/checkpoints/:checkpointId/restore',
    async (request, reply) => {
      const { checkpointId } = request.params

      try {
        const result = await restoreCheckpoint(checkpointId)
        return result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        if (errorMessage === 'Checkpoint not found' || errorMessage === 'Conversation not found') {
          return reply.status(404).send({ error: errorMessage })
        }
        request.log.error(`Failed to restore checkpoint: ${errorMessage}`)
        throw error
      }
    }
  )

  // Delete a checkpoint
  app.delete<{ Params: CheckpointParams }>(
    '/v1/conversations/:id/checkpoints/:checkpointId',
    async (request, reply) => {
      const { checkpointId } = request.params

      try {
        await deleteCheckpoint(checkpointId)
        return reply.status(204).send()
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        request.log.error(`Failed to delete checkpoint: ${errorMessage}`)
        throw error
      }
    }
  )
}
