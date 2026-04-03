import { config } from '../config.js'
import { logger } from '../logger.js'
import { convertToLangChainMessages, getChatModelFromModelId } from './llmProvider.js'
import { getDefaultProvider } from './providerRegistry.js'
import type { StyleAnalysis } from './styleAnalyzer.js'

export async function refineStyleAnalysis(
  analysis: StyleAnalysis,
  modelId?: string
): Promise<string> {
  logger.info('🧠 Generating narrative style profile with IA...')
  try {
    let effectiveModelId = modelId

    // If no model provided, use default provider's model
    if (!effectiveModelId) {
      const defaultProvider = await getDefaultProvider()
      if (!defaultProvider) {
        throw new Error('No provider configured')
      }
      effectiveModelId = `${defaultProvider.type}/${config.model}`
    }

    const model = await getChatModelFromModelId(effectiveModelId, false)

    // Prepare data for the IA to understand the style
    const rawBigrams = (analysis.bigrams || []).slice(0, 20).map(b => b.gram)
    const rawTransitions = (analysis.transitions || []).slice(0, 10).map(t => t.gram)
    const metrics = analysis.metrics

    const prompt = `
You are a world-class linguistic profiler. I will provide you with stylistic metadata and recurring expressions extracted from a user's writing.
Your task is to write a SUBTLE and CONCISE "System Prompt" (identity card) that an AI will use to mirror this user's voice.

METRICS:
- Avg Sentence Length: ${metrics.averageSentenceLength} words
- Lexical Richness: ${metrics.lexicalRichness}
- Question Ratio: ${metrics.questionRatio}
- Exclamation Ratio: ${metrics.exclamationRatio}
- First Person Ratio: ${metrics.pronounFirstPersonRatio}

RECURRING EXPRESSIONS:
${rawBigrams.join(', ')}

FAVORITE TRANSITIONS:
${rawTransitions.join(', ')}

STRICT INSTRUCTIONS FOR THE SYSTEM PROMPT YOU WILL WRITE:
1. NO BOLD TEXT: Never use bold (**) for keywords. It makes the output look robotic.
2. SUBTLETY: Describe the style as a vibe or a set of natural tendencies. Do not say "Always use X". Instead, say "You naturally lean towards..." or "Your tone is...".
3. CONCISION: Keep the final system prompt under 150 words.
4. CHAT OPTIMIZATION - CRITICAL:
   - For simple greetings (hi, hello, coucou), respond naturally in 1-2 sentences maximum
   - For simple questions, give brief direct answers first
   - Only elaborate when the user explicitly requests depth or asks complex questions
   - Example: "Hello" → "Hello! How can I help you today?" (NOT a formal paragraph)
   - The AI should match the user's energy level, not overpower it with formality
5. BALANCED FORMALITY:
   - Formal tone is for complex technical discussions
   - Natural conversational tone is for casual interactions
   - Never use overly academic or robotic language
6. NO FRAGMENTS: If you see truncated words or technical noise in the expressions, ignore them.

OUTPUT FORMAT:
Return ONLY the text of the generated system prompt. No introduction, no comments.
`

    const messages = convertToLangChainMessages([
      { role: 'system', content: 'You are a linguistic profiling assistant.' },
      { role: 'user', content: prompt },
    ])

    const response = await model.invoke(messages)
    const content = typeof response.content === 'string' ? response.content : ''

    if (!content) {
      throw new Error('LLM returned an empty response content.')
    }

    logger.info('✅ Narrative style profile generated.')
    return content.trim()
  } catch (error) {
    logger.error({ error }, '❌ Failed to generate narrative style profile')
    // Fallback to a basic string if AI fails
    return "You are MeSame, an AI assistant mirroring the user's natural style."
  }
}
