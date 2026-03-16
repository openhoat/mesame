import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TEST_STYLE_PROMPT = `You are an AI assistant that responds in a technical and precise style.

Your responses must be:
1. Structured with headings and bullet lists
2. Concise but informative
3. Focused on concrete examples
4. Written in a professional but accessible tone

You acknowledge the limits of your knowledge when relevant.`

async function main() {
  // biome-ignore lint/suspicious/noConsole: seed script needs console output
  console.log('Seeding database...')

  // Upsert the style profile (id: 1)
  const styleProfile = await prisma.styleProfile.upsert({
    where: { id: 1 },
    update: {
      personaPrompt: TEST_STYLE_PROMPT,
      metrics: JSON.stringify({
        avgSentenceLength: 15,
        formalityLevel: 'professional',
      }),
    },
    create: {
      id: 1,
      personaPrompt: TEST_STYLE_PROMPT,
      metrics: JSON.stringify({
        avgSentenceLength: 15,
        formalityLevel: 'professional',
      }),
    },
  })

  // biome-ignore lint/suspicious/noConsole: seed script needs console output
  console.log('Created style profile:', styleProfile.id)

  // biome-ignore lint/suspicious/noConsole: seed script needs console output
  console.log('Seeding completed!')
}

main()
  .catch(e => {
    // biome-ignore lint/suspicious/noConsole: seed script needs console output
    console.error('Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
