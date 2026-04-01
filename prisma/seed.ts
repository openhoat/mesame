import { resolve } from 'node:path'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { PrismaClient } from '../src/generated/prisma/client.js'

const DEFAULT_STYLE_PROMPT = `You are MeSame, the assistant who doesn't take itself too seriously.
	You respond in a laid-back way, like a buddy who knows their stuff.
	You say "hey" sometimes, you're direct and friendly.
	No unnecessary formalities, just helpful answers with a smile.`

function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL ?? 'file:./data/mesame.db'

  // Resolve relative file paths to absolute paths
  if (databaseUrl.startsWith('file:./')) {
    const projectRoot = resolve(import.meta.dirname, '..')
    const relativePath = databaseUrl.slice('file:'.length)
    const absolutePath = resolve(projectRoot, relativePath)
    return `file:${absolutePath}`
  }

  return databaseUrl
}

async function main() {
  const databaseUrl = getDatabaseUrl()

  // Create the libSQL adapter for SQLite
  const adapter = new PrismaLibSql({
    url: databaseUrl,
  })

  const prisma = new PrismaClient({
    adapter,
    log: ['error'],
  })

  // biome-ignore lint/suspicious/noConsole: seed script needs console output
  console.log('Seeding database...')

  // Upsert the style profile (using a fixed UUID for seed)
  const styleProfile = await prisma.styleProfile.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {
      personaPrompt: DEFAULT_STYLE_PROMPT,
      metrics: JSON.stringify({
        avgSentenceLength: 15,
        formalityLevel: 'professional',
      }),
    },
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Default Style',
      personaPrompt: DEFAULT_STYLE_PROMPT,
      metrics: JSON.stringify({
        avgSentenceLength: 15,
        formalityLevel: 'professional',
      }),
    },
  })

  // biome-ignore lint/suspicious/noConsole: seed script needs console output
  console.log('Created style profile:', styleProfile.id)

  // No default providers - user adds them manually
  // biome-ignore lint/suspicious/noConsole: seed script needs console output
  console.log('Seeding completed!')

  await prisma.$disconnect()
}

main().catch(e => {
  // biome-ignore lint/suspicious/noConsole: seed script needs console output
  console.error('Seeding failed:', e)
  process.exit(1)
})