/**
 * Mock LangChain ChatModel for testing
 *
 * Returns predefined responses without making real API calls.
 * Used in E2E and integration tests to avoid API costs and ensure deterministic results.
 */

import type { CallbackManagerForLLMRun } from '@langchain/core/callbacks/manager'
import type { BaseLanguageModelCallOptions } from '@langchain/core/language_models/base'
import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { AIMessage, AIMessageChunk, type BaseMessage } from '@langchain/core/messages'
import { ChatGenerationChunk } from '@langchain/core/outputs'

/**
 * Mock chat model that returns predefined responses
 */
export class MockChatModel extends BaseChatModel<BaseLanguageModelCallOptions, AIMessageChunk> {
  modelName = 'mock-model'

  constructor() {
    super({})
  }

  _llmType(): string {
    return 'mock'
  }

  /**
   * Generate a mock response based on the input messages
   */
  override async _generate(
    messages: BaseMessage[],
    _options: Partial<BaseLanguageModelCallOptions>,
    _runManager?: CallbackManagerForLLMRun
  ): Promise<{ generations: Array<{ text: string; message: AIMessage }> }> {
    // Get the last user message
    const lastMessage = messages[messages.length - 1]
    if (!lastMessage) {
      throw new Error('No messages provided')
    }
    const userContent = lastMessage.content.toString().toLowerCase()

    // Generate a mock response based on the user's message
    let responseText = 'This is a mock response from the AI assistant.'

    // Customize response based on common test messages
    if (userContent.includes('hello')) {
      responseText = 'Hello! How can I help you today?'
    } else if (userContent.includes('bonjour')) {
      responseText = "Bonjour ! Comment puis-je vous aider aujourd'hui ?"
    } else if (userContent.includes('list') || userContent.includes('files')) {
      responseText = 'Here are the files in the current directory: file1.txt, file2.txt, file3.txt'
    } else if (userContent.includes('technical') || userContent.includes('explain')) {
      responseText = `**Technical Explanation**

This is a structured technical response with:
- Clear headings
- Bullet points
- Code examples

\`\`\`javascript
const example = 'This is a code example';
console.log(example);
\`\`\`

**Key Points:**
- Point 1: First important concept
- Point 2: Second important concept
- Point 3: Third important concept`
    } else if (userContent.includes('json')) {
      responseText = `**JSON Overview**

JSON (JavaScript Object Notation) is a lightweight data format.

**Example:**
\`\`\`json
{
  "name": "Example",
  "value": 42,
  "active": true
}
\`\`\``
    }

    const message = new AIMessage(responseText)

    return {
      generations: [
        {
          text: responseText,
          message,
        },
      ],
    }
  }

  /**
   * Stream mock responses (returns the full response in chunks)
   */
  override async *_streamResponseChunks(
    messages: BaseMessage[],
    options: Partial<BaseLanguageModelCallOptions>,
    runManager?: CallbackManagerForLLMRun
  ): AsyncGenerator<ChatGenerationChunk> {
    // Generate the full response
    const result = await this._generate(messages, options, runManager)
    const fullText = result.generations[0]?.text

    if (!fullText) {
      throw new Error('No response generated')
    }

    // Split into words and yield as chunks (no delay for tests)
    const words = fullText.split(' ')
    for (let i = 0; i < words.length; i++) {
      const chunk = words[i] + (i < words.length - 1 ? ' ' : '')
      const chunkMessage = new AIMessageChunk(chunk)
      yield new ChatGenerationChunk({
        text: chunk,
        message: chunkMessage,
      })
      // No delay for fast test execution
    }
  }
}
