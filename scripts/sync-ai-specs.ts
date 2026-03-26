#!/usr/bin/env tsx
/**
 * Sync AI Specifications
 *
 * Synchronizes specifications from ai-specs/ to:
 * - .clinerules/ (for Cline AI assistant)
 * - .claude/ (for Claude Code AI assistant)
 */

import * as fs from 'fs'
import * as path from 'path'

const PROJECT_ROOT = path.resolve(import.meta.dirname, '..')

interface SyncConfig {
  source: string
  targets: Array<{
    dest: string
    transform?: (content: string, filename: string) => string
    subdir?: string
  }>
}

const SYNC_CONFIGS: SyncConfig[] = [
  // Rules -> .clinerules/ and .claude/rules/
  {
    source: 'ai-specs/rules',
    targets: [
      { dest: '.clinerules' },
      { dest: '.claude/rules' },
    ],
  },
  // Workflows -> .clinerules/workflows/
  {
    source: 'ai-specs/workflows',
    targets: [
      { dest: '.clinerules/workflows' },
    ],
  },
  // Skills -> .claude/skills/*/SKILL.md
  {
    source: 'ai-specs/skills',
    targets: [
      { dest: '.claude/skills', isSkill: true },
    ],
  },
  // Agents -> .claude/agents/
  {
    source: 'ai-specs/agents',
    targets: [
      { dest: '.claude/agents' },
    ],
  },
]

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function copyFile(src: string, dest: string): void {
  ensureDir(path.dirname(dest))
  fs.copyFileSync(src, dest)
  console.log(`  ✓ ${path.relative(PROJECT_ROOT, dest)}`)
}

function syncRules(sourceDir: string, targets: Array<{ dest: string }>): void {
  const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.md'))

  for (const file of files) {
    const srcPath = path.join(sourceDir, file)

    for (const target of targets) {
      const destPath = path.join(PROJECT_ROOT, target.dest, file)
      copyFile(srcPath, destPath)
    }
  }
}

function syncWorkflows(sourceDir: string, targets: Array<{ dest: string }>): void {
  const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.md'))

  for (const file of files) {
    const srcPath = path.join(sourceDir, file)

    for (const target of targets) {
      const destPath = path.join(PROJECT_ROOT, target.dest, file)
      copyFile(srcPath, destPath)
    }
  }
}

function syncSkills(sourceDir: string, targets: Array<{ dest: string; isSkill?: boolean }>): void {
  const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.md'))

  for (const file of files) {
    const srcPath = path.join(sourceDir, file)
    const skillName = file.replace('.md', '')

    for (const target of targets) {
      if (target.isSkill) {
        // Skills go into .claude/skills/{name}/SKILL.md
        const skillDir = path.join(PROJECT_ROOT, target.dest, skillName)
        ensureDir(skillDir)
        const destPath = path.join(skillDir, 'SKILL.md')
        copyFile(srcPath, destPath)
      } else {
        const destPath = path.join(PROJECT_ROOT, target.dest, file)
        copyFile(srcPath, destPath)
      }
    }
  }
}

function checkSync(): { inSync: boolean; differences: string[] } {
  const differences: string[] = []

  for (const config of SYNC_CONFIGS) {
    const sourceDir = path.join(PROJECT_ROOT, config.source)
    if (!fs.existsSync(sourceDir)) {
      differences.push(`Source directory missing: ${config.source}`)
      continue
    }

    const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.md'))

    for (const file of files) {
      const srcPath = path.join(sourceDir, file)
      const srcContent = fs.readFileSync(srcPath, 'utf-8')

      for (const target of config.targets) {
        let destPath: string

        if (target.isSkill) {
          const skillName = file.replace('.md', '')
          destPath = path.join(PROJECT_ROOT, target.dest, skillName, 'SKILL.md')
        } else {
          destPath = path.join(PROJECT_ROOT, target.dest, file)
        }

        if (!fs.existsSync(destPath)) {
          differences.push(`Missing: ${path.relative(PROJECT_ROOT, destPath)}`)
          continue
        }

        const destContent = fs.readFileSync(destPath, 'utf-8')
        if (srcContent !== destContent) {
          differences.push(`Out of sync: ${path.relative(PROJECT_ROOT, destPath)}`)
        }
      }
    }
  }

  return {
    inSync: differences.length === 0,
    differences,
  }
}

function syncAgents(sourceDir: string, targets: Array<{ dest: string }>): void {
  const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.md'))

  for (const file of files) {
    const srcPath = path.join(sourceDir, file)

    for (const target of targets) {
      const destPath = path.join(PROJECT_ROOT, target.dest, file)
      copyFile(srcPath, destPath)
    }
  }
}

function sync(): void {
  console.log('\n🔄 Syncing AI specifications...\n')

  for (const config of SYNC_CONFIGS) {
    const sourceDir = path.join(PROJECT_ROOT, config.source)

    if (!fs.existsSync(sourceDir)) {
      console.log(`⚠️  Source directory not found: ${config.source}`)
      continue
    }

    console.log(`📁 ${config.source}`)

    if (config.source.includes('rules')) {
      syncRules(sourceDir, config.targets)
    } else if (config.source.includes('workflows')) {
      syncWorkflows(sourceDir, config.targets)
    } else if (config.source.includes('skills')) {
      syncSkills(sourceDir, config.targets)
    } else if (config.source.includes('agents')) {
      syncAgents(sourceDir, config.targets)
    }
  }

  console.log('\n✅ Sync complete!\n')
}

function main(): void {
  const args = process.argv.slice(2)

  if (args.includes('--check') || args.includes('-c')) {
    // Check mode - verify sync status without making changes
    console.log('\n🔍 Checking sync status...\n')
    const result = checkSync()

    if (result.inSync) {
      console.log('✅ All files are in sync!\n')
      process.exit(0)
    } else {
      console.log('❌ Files out of sync:\n')
      for (const diff of result.differences) {
        console.log(`  ${diff}`)
      }
      console.log('\n💡 Run `npm run sync:ai:specs` to synchronize.\n')
      process.exit(1)
    }
  } else {
    // Sync mode - perform synchronization
    sync()
  }
}

main()