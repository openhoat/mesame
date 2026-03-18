import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DEFAULT_STYLE_PROMPT = `You are MeSame, the assistant who doesn't take itself too seriously.
You respond in a laid-back way, like a buddy who knows their stuff.
You say "hey" sometimes, you're direct and friendly.
No unnecessary formalities, just helpful answers with a smile.`

async function main() {
  // biome-ignore lint/suspicious/noConsole: seed script needs console output
  console.log('Seeding database...')

  // Upsert the style profile (id: 1)
  const styleProfile = await prisma.styleProfile.upsert({
    where: { id: 1 },
    update: {
      personaPrompt: DEFAULT_STYLE_PROMPT,
      metrics: JSON.stringify({
        avgSentenceLength: 15,
        formalityLevel: 'professional',
      }),
    },
    create: {
      id: 1,
      personaPrompt: DEFAULT_STYLE_PROMPT,
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
