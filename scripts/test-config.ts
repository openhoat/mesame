#!/usr/bin/env tsx

// Test script to verify configuration loading

import { config } from '../src/config.js'

console.log('=== MeSame Configuration Test ===\n')
console.log('Environment Variables:')
console.log('  MESAME_MODEL:', process.env.MESAME_MODEL || '(not set)')
console.log('  MESAME_PROVIDER:', process.env.MESAME_PROVIDER || '(not set)')
console.log('  MESAME_PORT:', process.env.MESAME_PORT || '(not set)')
console.log('  MESAME_HOST:', process.env.MESAME_HOST || '(not set)')
console.log('  MESAME_LOG_LEVEL:', process.env.MESAME_LOG_LEVEL || '(not set)')
console.log('  OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '***set***' : '(not set)')
console.log('  ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? '***set***' : '(not set)')
console.log('  GOOGLE_API_KEY:', process.env.GOOGLE_API_KEY ? '***set***' : '(not set)')

console.log('\nLoaded Configuration:')
console.log('  port:', config.port)
console.log('  host:', config.host)
console.log('  provider:', config.provider)
console.log('  model:', config.model)
console.log('  targetBaseUrl:', config.targetBaseUrl)
console.log('  targetApiKey:', config.targetApiKey ? '***set***' : '(not set)')
console.log('  logLevel:', config.logLevel)

console.log('\n✅ Configuration loaded successfully!')
