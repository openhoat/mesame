import { beforeEach, describe, expect, test, vi } from 'vitest'
import { prisma } from '../db.js'
import {
  createConversation,
  deleteConversation,
  getAllConversations,
  getConversationById,
  updateConversation,
} from './conversationService.js'

vi.mock('../db.js', () => ({
  prisma: {
    conversation: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

describe('conversationService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createConversation', () => {
    test('should create a conversation with title and messages', async () => {
      const data = {
        title: 'Test Conversation',
        messages: [
          { role: 'user' as const, content: 'Hello' },
          { role: 'assistant' as const, content: 'Hi there!' },
        ],
      }
      const expected = {
        id: 'uuid-1',
        title: data.title,
        messages: JSON.stringify(data.messages),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      vi.mocked(prisma.conversation.create).mockResolvedValueOnce(expected)

      const result = await createConversation(data)

      expect(result.id).toBe('uuid-1')
      expect(result.title).toBe('Test Conversation')
      expect(result.messages).toEqual(data.messages)
      expect(prisma.conversation.create).toHaveBeenCalledWith({
        data: {
          title: data.title,
          messages: JSON.stringify(data.messages),
        },
      })
    })
  })

  describe('getAllConversations', () => {
    test('should return all conversations ordered by update date', async () => {
      const conversations = [
        {
          id: 'uuid-2',
          title: 'Newer',
          messages: JSON.stringify([{ role: 'user', content: 'b' }]),
          createdAt: new Date('2026-01-02'),
          updatedAt: new Date('2026-01-03'),
        },
        {
          id: 'uuid-1',
          title: 'Older',
          messages: JSON.stringify([{ role: 'user', content: 'a' }]),
          createdAt: new Date('2026-01-01'),
          updatedAt: new Date('2026-01-02'),
        },
      ]
      vi.mocked(prisma.conversation.findMany).mockResolvedValueOnce(conversations)

      const result = await getAllConversations()

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('uuid-2')
      expect(result[0].messages).toEqual([{ role: 'user', content: 'b' }])
      expect(prisma.conversation.findMany).toHaveBeenCalledWith({
        orderBy: { updatedAt: 'desc' },
      })
    })

    test('should return empty array when no conversations exist', async () => {
      vi.mocked(prisma.conversation.findMany).mockResolvedValueOnce([])

      const result = await getAllConversations()

      expect(result).toEqual([])
    })
  })

  describe('getConversationById', () => {
    test('should return a conversation when found', async () => {
      const conversation = {
        id: 'uuid-1',
        title: 'Test',
        messages: JSON.stringify([{ role: 'user', content: 'hello' }]),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      vi.mocked(prisma.conversation.findUnique).mockResolvedValueOnce(conversation)

      const result = await getConversationById('uuid-1')

      expect(result?.id).toBe('uuid-1')
      expect(result?.messages).toEqual([{ role: 'user', content: 'hello' }])
      expect(prisma.conversation.findUnique).toHaveBeenCalledWith({ where: { id: 'uuid-1' } })
    })

    test('should return null when conversation not found', async () => {
      vi.mocked(prisma.conversation.findUnique).mockResolvedValueOnce(null)

      const result = await getConversationById('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('updateConversation', () => {
    test('should update conversation title', async () => {
      const updated = {
        id: 'uuid-1',
        title: 'Updated Title',
        messages: JSON.stringify([{ role: 'user', content: 'hello' }]),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      vi.mocked(prisma.conversation.update).mockResolvedValueOnce(updated)

      const result = await updateConversation('uuid-1', { title: 'Updated Title' })

      expect(result.title).toBe('Updated Title')
      expect(prisma.conversation.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { title: 'Updated Title' },
      })
    })

    test('should update conversation messages', async () => {
      const newMessages = [
        { role: 'user' as const, content: 'hello' },
        { role: 'assistant' as const, content: 'hi' },
      ]
      const updated = {
        id: 'uuid-1',
        title: 'Test',
        messages: JSON.stringify(newMessages),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      vi.mocked(prisma.conversation.update).mockResolvedValueOnce(updated)

      const result = await updateConversation('uuid-1', { messages: newMessages })

      expect(result.messages).toEqual(newMessages)
      expect(prisma.conversation.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { messages: JSON.stringify(newMessages) },
      })
    })
  })

  describe('deleteConversation', () => {
    test('should delete a conversation by id', async () => {
      const conversation = {
        id: 'uuid-1',
        title: 'Test',
        messages: JSON.stringify([{ role: 'user', content: 'hello' }]),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      vi.mocked(prisma.conversation.delete).mockResolvedValueOnce(conversation)

      const result = await deleteConversation('uuid-1')

      expect(result.id).toBe('uuid-1')
      expect(prisma.conversation.delete).toHaveBeenCalledWith({ where: { id: 'uuid-1' } })
    })
  })
})
