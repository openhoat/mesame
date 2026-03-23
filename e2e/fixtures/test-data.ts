/**
 * Test data fixtures for E2E testing
 *
 * Provides reusable test data for sources, profiles, and messages
 * to ensure consistency across test suites.
 */

export interface TestSource {
  filename: string
  content: string
  type: 'text/plain' | 'application/pdf' | 'text/markdown'
}

export interface TestProfile {
  name: string
  personaPrompt: string
}

export interface TestMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

/**
 * Test sources with different writing styles
 */
export const TEST_SOURCES: Record<string, TestSource> = {
  casual: {
    filename: 'casual-style.txt',
    content: `Hey there! I'm super excited to share some thoughts with you.
Life is awesome when you're doing what you love, right? I totally believe in keeping things simple and fun.
No need for fancy words - just good vibes and genuine connections.
You know what I mean? Let's keep it real and enjoy the journey!`,
    type: 'text/plain',
  },

  technical: {
    filename: 'technical-style.md',
    content: `# Technical Analysis Report

## Abstract

This document presents a comprehensive analysis of the system architecture,
focusing on scalability, performance optimization, and fault tolerance mechanisms.

## Methodology

The evaluation was conducted using industry-standard benchmarking tools,
with particular attention to latency metrics and throughput capacity.

## Findings

1. **Performance Metrics**: The system demonstrates consistent sub-millisecond response times
2. **Scalability**: Horizontal scaling capabilities have been validated up to 1000 concurrent users
3. **Reliability**: Fault injection testing confirms 99.9% uptime SLA compliance

## Conclusion

The architecture satisfies all specified requirements and exceeds baseline performance targets.`,
    type: 'text/markdown',
  },

  professional: {
    filename: 'professional-style.txt',
    content: `Dear Colleagues,

I am writing to provide an update on our recent initiatives and strategic direction.
Our team has made significant progress in achieving the quarterly objectives outlined
during the previous stakeholder meeting.

I would like to highlight the following accomplishments:

First, we have successfully implemented the new workflow automation system,
resulting in a 30% improvement in operational efficiency.

Second, our customer satisfaction scores have increased by 15 percentage points,
reflecting our commitment to service excellence.

I appreciate your continued dedication and look forward to our continued collaboration.

Best regards,
Professional Writer`,
    type: 'text/plain',
  },

  minimal: {
    filename: 'minimal-style.txt',
    content: `Short sentences. Direct communication.
No fluff. Just facts.
Clear and concise.
Easy to understand.
Gets the point across.`,
    type: 'text/plain',
  },
}

/**
 * Pre-configured test profiles
 */
export const TEST_PROFILES: Record<string, TestProfile> = {
  casual: {
    name: 'Casual Writer',
    personaPrompt:
      'You write in a very casual, friendly, and enthusiastic tone. Use contractions, informal language, and exclamation marks. Sound like a friend chatting over coffee.',
  },

  technical: {
    name: 'Technical Expert',
    personaPrompt:
      'You write in a formal, technical, and precise manner. Use industry terminology, structured arguments, and data-driven insights. Sound like a professional technical writer.',
  },

  professional: {
    name: 'Professional Correspondent',
    personaPrompt:
      'You write in a polished, professional business tone. Use formal greetings, complete sentences, and diplomatic language. Sound like a corporate executive.',
  },

  minimal: {
    name: 'Minimalist',
    personaPrompt:
      'You write in extremely short, direct sentences. No elaboration. Just core facts. Maximum clarity with minimum words.',
  },
}

/**
 * Test messages for chat testing
 */
export const TEST_MESSAGES: Record<string, TestMessage> = {
  simpleGreeting: {
    role: 'user',
    content: 'Hello, how are you?',
  },

  technicalQuestion: {
    role: 'user',
    content: 'Explain how a proxy server works',
  },

  opinionRequest: {
    role: 'user',
    content: 'What do you think about AI technology?',
  },

  instructionRequest: {
    role: 'user',
    content: 'Give me a recipe for chocolate cake',
  },

  complexQuery: {
    role: 'user',
    content:
      'Explain the difference between supervised and unsupervised machine learning, and provide examples of when to use each approach',
  },
}

/**
 * Provider configurations for testing
 */
export const TEST_PROVIDERS = {
  openai: {
    name: 'openai',
    baseUrl: 'https://api.openai.com',
    defaultModel: 'gpt-4o-mini',
    requiresApiKey: true,
  },

  anthropic: {
    name: 'anthropic',
    baseUrl: 'https://api.anthropic.com',
    defaultModel: 'claude-3-5-sonnet-20241022',
    requiresApiKey: true,
  },

  ollama: {
    name: 'ollama',
    baseUrl: 'http://localhost:11434',
    defaultModel: 'llama2',
    requiresApiKey: false,
  },

  gemini: {
    name: 'google',
    baseUrl: 'https://generativelanguage.googleapis.com',
    defaultModel: 'gemini-pro',
    requiresApiKey: true,
  },
} as const

/**
 * Expected style indicators for validation
 */
export const STYLE_INDICATORS = {
  casual: {
    patterns: [/hey|hi|hello/i, /!/, /awesome|cool|great|super/i, /(you know|right\?|totally)/i],
    avoidPatterns: [/hereby|therefore|furthermore/i],
  },

  technical: {
    patterns: [/system|architecture|implementation|performance/i, /\d+%/, /analysis|evaluation/i],
    avoidPatterns: [/awesome|cool|hey/i, /!/],
  },

  professional: {
    patterns: [/dear|regards|sincerely/i, /appreciate|pleased|honored/i, /colleagues|team/i],
    avoidPatterns: [/hey|cool|awesome/i, /!/],
  },

  minimal: {
    patterns: [/^[^.!?]{1,50}[.!?]$/m], // Short sentences
    avoidPatterns: [/however|therefore|furthermore/i], // Avoid connectors
  },
} as const
