#!/usr/bin/env tsx
/**
 * Fix Prisma 7 generated imports for ESM compatibility.
 *
 * Prisma 7 generates imports without .js extensions, which doesn't work
 * with ESM in Node.js. This script adds .js extensions to all local imports
 * in the generated Prisma files.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const PRISMA_DIR = resolve(import.meta.dirname, '../node_modules/.prisma/client')

function fixImports(content: string): string {
  // Match import statements with relative paths (without .js extension)
  // e.g., import * as $Enums from "./enums"
  return content.replace(/from\s+['"](\.[^'"]+)['"]/g, (match, path) => {
    // Skip if already has .js extension
    if (path.endsWith('.js')) {
      return match
    }
    // Add .js extension
    return `from '${path}.js'`
  })
}

function processDirectory(dir: string): number {
  let fixedCount = 0
  const entries = readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)

    if (entry.isDirectory()) {
      fixedCount += processDirectory(fullPath)
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      const content = readFileSync(fullPath, 'utf-8')
      const fixed = fixImports(content)

      if (content !== fixed) {
        writeFileSync(fullPath, fixed, 'utf-8')
        fixedCount++
      }
    }
  }

  return fixedCount
}

function main() {
  const fixedCount = processDirectory(PRISMA_DIR)
  console.log(`Fixed ${fixedCount} Prisma files`)
}

main()
