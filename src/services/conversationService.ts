import { prisma } from '../db.js'
import { logger } from '../logger.js'

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'error'
  content: string
  isStreaming?: boolean
}

export interface ConversationData {
  title: string
  messages: ConversationMessage[]
}

export interface ConversationUpdate {
  title?: string
  messages?: ConversationMessage[]
}

export interface ConversationResponse {
  id: string
  title: string
  messages: ConversationMessage[]
  createdAt: Date
  updatedAt: Date
}

export async function createConversation(data: ConversationData): Promise<ConversationResponse> {
  logger.debug(`Creating conversation: ${data.title}`)
  try {
    const conversation = await prisma.conversation.create({
      data: {
        title: data.title,
        messages: JSON.stringify(data.messages),
      },
    })
    logger.info(`✅ Conversation created: ${conversation.id}`)
    return {
      ...conversation,
      messages: JSON.parse(conversation.messages) as ConversationMessage[],
    }
  } catch (error) {
    logger.error(`❌ Failed to create conversation: ${error}`)
    throw error
  }
}

export async function getAllConversations(): Promise<ConversationResponse[]> {
  logger.debug('Fetching all conversations from database...')
  try {
    const conversations = await prisma.conversation.findMany({
      orderBy: { updatedAt: 'desc' },
    })
    logger.info(`✅ Retrieved ${conversations.length} conversations`)
    return conversations.map(conv => ({
      ...conv,
      messages: JSON.parse(conv.messages) as ConversationMessage[],
    }))
  } catch (error) {
    logger.error(`❌ Failed to fetch conversations: ${error}`)
    throw error
  }
}

export async function getConversationById(id: string): Promise<ConversationResponse | null> {
  logger.debug(`Fetching conversation by ID: ${id}`)
  try {
    const conversation = await prisma.conversation.findUnique({ where: { id } })
    if (conversation) {
      logger.debug(`✅ Conversation found: ${id}`)
      return {
        ...conversation,
        messages: JSON.parse(conversation.messages) as ConversationMessage[],
      }
    }
    logger.debug(`Conversation not found: ${id}`)
    return null
  } catch (error) {
    logger.error(`❌ Failed to fetch conversation: ${error}`)
    throw error
  }
}

export async function updateConversation(
  id: string,
  data: ConversationUpdate
): Promise<ConversationResponse> {
  logger.debug(`Updating conversation: ${id}`)
  try {
    const updateData: { title?: string; messages?: string } = {}
    if (data.title !== undefined) {
      updateData.title = data.title
    }
    if (data.messages !== undefined) {
      updateData.messages = JSON.stringify(data.messages)
    }

    const conversation = await prisma.conversation.update({
      where: { id },
      data: updateData,
    })
    logger.info(`✅ Conversation updated: ${id}`)
    return {
      ...conversation,
      messages: JSON.parse(conversation.messages) as ConversationMessage[],
    }
  } catch (error) {
    logger.error(`❌ Failed to update conversation: ${error}`)
    throw error
  }
}

export async function deleteConversation(id: string): Promise<ConversationResponse> {
  logger.debug(`Deleting conversation: ${id}`)
  try {
    const conversation = await prisma.conversation.delete({ where: { id } })
    logger.info(`✅ Conversation deleted: ${id}`)
    return {
      ...conversation,
      messages: JSON.parse(conversation.messages) as ConversationMessage[],
    }
  } catch (error) {
    logger.error(`❌ Failed to delete conversation: ${error}`)
    throw error
  }
}
