import { prisma } from '../db.js'
import { logger } from '../logger.js'

export interface CheckpointData {
  conversationId: string
  messageIndex: number
  title: string
}

export interface CheckpointResponse {
  id: string
  conversationId: string
  messageIndex: number
  title: string
  createdAt: Date
}

export const createCheckpoint = async (data: CheckpointData): Promise<CheckpointResponse> => {
  logger.debug(`Creating checkpoint for conversation: ${data.conversationId}`)
  try {
    const checkpoint = await prisma.checkpoint.create({
      data: {
        conversationId: data.conversationId,
        messageIndex: data.messageIndex,
        title: data.title,
      },
    })
    logger.info(`Checkpoint created: ${checkpoint.id}`)
    return checkpoint
  } catch (error) {
    logger.error(`Failed to create checkpoint: ${error}`)
    throw error
  }
}

export const getCheckpointsByConversation = async (
  conversationId: string
): Promise<CheckpointResponse[]> => {
  logger.debug(`Fetching checkpoints for conversation: ${conversationId}`)
  try {
    const checkpoints = await prisma.checkpoint.findMany({
      where: { conversationId },
      orderBy: { messageIndex: 'asc' },
    })
    logger.debug(`Found ${checkpoints.length} checkpoints`)
    return checkpoints
  } catch (error) {
    logger.error(`Failed to fetch checkpoints: ${error}`)
    throw error
  }
}

export const restoreCheckpoint = async (
  checkpointId: string
): Promise<{
  conversation: { id: string; messages: unknown[] }
  checkpoint: CheckpointResponse
}> => {
  logger.debug(`Restoring checkpoint: ${checkpointId}`)
  try {
    const checkpoint = await prisma.checkpoint.findUnique({ where: { id: checkpointId } })
    if (!checkpoint) {
      throw new Error('Checkpoint not found')
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: checkpoint.conversationId },
    })
    if (!conversation) {
      throw new Error('Conversation not found')
    }

    const messages = JSON.parse(conversation.messages) as unknown[]
    const truncatedMessages = messages.slice(0, checkpoint.messageIndex)

    // Update conversation with truncated messages
    await prisma.conversation.update({
      where: { id: checkpoint.conversationId },
      data: { messages: JSON.stringify(truncatedMessages) },
    })

    // Delete all checkpoints at or after this one (including the restored one)
    await prisma.checkpoint.deleteMany({
      where: {
        conversationId: checkpoint.conversationId,
        messageIndex: { gte: checkpoint.messageIndex },
      },
    })

    logger.info(`Restored checkpoint ${checkpointId} (${checkpoint.messageIndex} messages)`)
    return {
      conversation: { id: checkpoint.conversationId, messages: truncatedMessages },
      checkpoint,
    }
  } catch (error) {
    logger.error(`Failed to restore checkpoint: ${error}`)
    throw error
  }
}

export const deleteCheckpoint = async (checkpointId: string): Promise<CheckpointResponse> => {
  logger.debug(`Deleting checkpoint: ${checkpointId}`)
  try {
    const checkpoint = await prisma.checkpoint.delete({ where: { id: checkpointId } })
    logger.info(`Checkpoint deleted: ${checkpointId}`)
    return checkpoint
  } catch (error) {
    logger.error(`Failed to delete checkpoint: ${error}`)
    throw error
  }
}
