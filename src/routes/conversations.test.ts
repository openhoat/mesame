import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { buildApp } from '../app.js'
import { resetConfig } from '../config.js'
import * as conversationService from '../services/conversationService.js'
import * as sourceService from '../services/sourceService.js'

vi.mock('../services/conversationService.js')
vi.mock('../services/sourceService.js')
vi.mock('../services/styleProfileService.js', () => ({
  ensureDefaultProfile: vi.fn().mockResolvedValue(undefined),
}))

describe('conversations route', () => {
  let app: Awaited<ReturnType<typeof buildApp>>

  beforeEach(async () => {
    vi.clearAllMocks()
    resetConfig()
    app = await buildApp()
  })

  afterEach(async () => {
    await app.close()
  })

  describe('POST /v1/conversations', () => {
    test('should create a new conversation', async () => {
      const mockConversation = {
        id: 'conv-1',
        title: 'Test Conversation',
        messages: [{ role: 'user' as const, content: 'Hello' }],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      vi.mocked(conversationService.createConversation).mockResolvedValueOnce(mockConversation)

      const response = await app.inject({
        method: 'POST',
        url: '/v1/conversations',
        payload: {
          title: 'Test Conversation',
          messages: [{ role: 'user', content: 'Hello' }],
        },
      })

      expect(response.statusCode).toBe(201)
      expect(response.json()).toMatchObject({
        title: 'Test Conversation',
        messages: [{ role: 'user', content: 'Hello' }],
      })
    })

    test('should return 400 if title is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/conversations',
        payload: {
          messages: [{ role: 'user', content: 'Hello' }],
        },
      })

      expect(response.statusCode).toBe(400)
      expect(response.json()).toEqual({ error: 'title is required' })
    })

    test('should return 400 if messages is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/conversations',
        payload: {
          title: 'Test',
        },
      })

      expect(response.statusCode).toBe(400)
      expect(response.json()).toEqual({ error: 'messages array is required' })
    })
  })

  describe('GET /v1/conversations', () => {
    test('should return all conversations', async () => {
      const mockConversations = [
        {
          id: 'conv-1',
          title: 'Conversation 1',
          messages: [{ role: 'user' as const, content: 'Hello' }],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]
      vi.mocked(conversationService.getAllConversations).mockResolvedValueOnce(mockConversations)

      const response = await app.inject({
        method: 'GET',
        url: '/v1/conversations',
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toHaveLength(1)
    })
  })

  describe('GET /v1/conversations/:id', () => {
    test('should return conversation by id', async () => {
      const mockConversation = {
        id: 'conv-1',
        title: 'Test Conversation',
        messages: [{ role: 'user' as const, content: 'Hello' }],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      vi.mocked(conversationService.getConversationById).mockResolvedValueOnce(mockConversation)

      const response = await app.inject({
        method: 'GET',
        url: '/v1/conversations/conv-1',
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toMatchObject({ id: 'conv-1', title: 'Test Conversation' })
    })

    test('should return 404 when conversation not found', async () => {
      vi.mocked(conversationService.getConversationById).mockResolvedValueOnce(null)

      const response = await app.inject({
        method: 'GET',
        url: '/v1/conversations/nonexistent',
      })

      expect(response.statusCode).toBe(404)
      expect(response.json()).toEqual({ error: 'Conversation not found' })
    })
  })

  describe('PATCH /v1/conversations/:id', () => {
    test('should update conversation', async () => {
      const mockConversation = {
        id: 'conv-1',
        title: 'Updated Title',
        messages: [{ role: 'user' as const, content: 'Hello' }],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      vi.mocked(conversationService.updateConversation).mockResolvedValueOnce(mockConversation)

      const response = await app.inject({
        method: 'PATCH',
        url: '/v1/conversations/conv-1',
        payload: {
          title: 'Updated Title',
        },
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toMatchObject({ title: 'Updated Title' })
    })

    test('should return 400 if no fields to update', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: '/v1/conversations/conv-1',
        payload: {},
      })

      expect(response.statusCode).toBe(400)
      expect(response.json()).toEqual({
        error: 'At least one field (title or messages) is required',
      })
    })
  })

  describe('DELETE /v1/conversations/:id', () => {
    test('should delete conversation', async () => {
      const mockConversation = {
        id: 'conv-1',
        title: 'Test',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      vi.mocked(conversationService.getConversationById).mockResolvedValueOnce(mockConversation)
      vi.mocked(conversationService.deleteConversation).mockResolvedValueOnce()

      const response = await app.inject({
        method: 'DELETE',
        url: '/v1/conversations/conv-1',
      })

      expect(response.statusCode).toBe(204)
    })

    test('should return 404 when conversation not found', async () => {
      vi.mocked(conversationService.getConversationById).mockResolvedValueOnce(null)

      const response = await app.inject({
        method: 'DELETE',
        url: '/v1/conversations/nonexistent',
      })

      expect(response.statusCode).toBe(404)
    })
  })

  describe('GET /v1/conversations/export', () => {
    test('should export all conversations with metadata', async () => {
      const now = new Date()
      const mockConversations = [
        {
          id: 'conv-1',
          title: 'Conversation 1',
          messages: [
            { role: 'user' as const, content: 'Hello' },
            { role: 'assistant' as const, content: 'Hi there!' },
          ],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'conv-2',
          title: 'Conversation 2',
          messages: [{ role: 'user' as const, content: 'Test' }],
          createdAt: now,
          updatedAt: now,
        },
      ]
      vi.mocked(conversationService.getAllConversations).mockResolvedValueOnce(mockConversations)

      const response = await app.inject({
        method: 'GET',
        url: '/v1/conversations/export',
      })

      expect(response.statusCode).toBe(200)
      const result = response.json()
      expect(result).toHaveProperty('exportedAt')
      expect(result).toHaveProperty('version', '1.0')
      expect(result).toHaveProperty('count', 2)
      expect(result).toHaveProperty('conversations')
      expect(result.conversations).toHaveLength(2)
      expect(result.conversations[0]).toMatchObject({
        id: 'conv-1',
        title: 'Conversation 1',
      })
    })
  })

  describe('POST /v1/conversations/:id/source', () => {
    test('should convert conversation to source', async () => {
      const mockConversation = {
        id: 'conv-1',
        title: 'Test Conversation',
        messages: [
          { role: 'user' as const, content: 'Hello' },
          { role: 'assistant' as const, content: 'Hi there!' },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const mockSource = {
        id: 'source-1',
        title: 'Conversation: Test Conversation',
        content: 'Moi : Hello\n\nAssistant : Hi there!',
        createdAt: new Date(),
      }

      vi.mocked(conversationService.getConversationById).mockResolvedValueOnce(mockConversation)
      vi.mocked(sourceService.createSource).mockResolvedValueOnce(mockSource)

      const response = await app.inject({
        method: 'POST',
        url: '/v1/conversations/conv-1/source',
      })

      expect(response.statusCode).toBe(201)
      expect(response.json()).toMatchObject({
        id: 'source-1',
        title: 'Conversation: Test Conversation',
      })
      expect(sourceService.createSource).toHaveBeenCalledWith({
        title: 'Conversation: Test Conversation',
        content: 'Moi : Hello\n\nAssistant : Hi there!',
      })
    })

    test('should return 404 when conversation not found', async () => {
      vi.mocked(conversationService.getConversationById).mockResolvedValueOnce(null)

      const response = await app.inject({
        method: 'POST',
        url: '/v1/conversations/nonexistent/source',
      })

      expect(response.statusCode).toBe(404)
      expect(response.json()).toEqual({ error: 'Conversation not found' })
    })
  })
})
