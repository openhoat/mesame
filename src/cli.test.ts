import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { parseCliArgs } from './cli.js'

describe('parseCliArgs', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  test('should parse port option', () => {
    const options = parseCliArgs(['node', 'cli.js', '--port', '8080'])
    expect(options.port).toBe(8080)
  })

  test('should parse host option', () => {
    const options = parseCliArgs(['node', 'cli.js', '--host', '0.0.0.0'])
    expect(options.host).toBe('0.0.0.0')
  })

  test('should parse provider option', () => {
    const options = parseCliArgs(['node', 'cli.js', '--provider', 'openai'])
    expect(options.provider).toBe('openai')
  })

  test('should parse model option', () => {
    const options = parseCliArgs(['node', 'cli.js', '--model', 'gpt-4'])
    expect(options.model).toBe('gpt-4')
  })

  test('should parse target-base-url option', () => {
    const options = parseCliArgs(['node', 'cli.js', '--target-base-url', 'https://api.example.com'])
    expect(options.targetBaseUrl).toBe('https://api.example.com')
  })

  test('should parse log-level option', () => {
    const options = parseCliArgs(['node', 'cli.js', '--log-level', 'debug'])
    expect(options.logLevel).toBe('debug')
  })

  test('should parse language option', () => {
    const options = parseCliArgs(['node', 'cli.js', '--language', 'fr'])
    expect(options.language).toBe('fr')
  })

  test('should parse short options', () => {
    const options = parseCliArgs(['node', 'cli.js', '-p', '9000', '-m', 'gpt-3.5-turbo'])
    expect(options.port).toBe(9000)
    expect(options.model).toBe('gpt-3.5-turbo')
  })

  test('should throw error for invalid provider', () => {
    expect(() => parseCliArgs(['node', 'cli.js', '--provider', 'invalid'])).toThrow(
      'Invalid provider'
    )
  })

  test('should throw error for invalid log level', () => {
    expect(() => parseCliArgs(['node', 'cli.js', '--log-level', 'invalid'])).toThrow(
      'Invalid log level'
    )
  })

  test('should return empty options when no arguments provided', () => {
    const options = parseCliArgs(['node', 'cli.js'])
    expect(options.port).toBeUndefined()
    expect(options.host).toBeUndefined()
    expect(options.provider).toBeUndefined()
  })

  test('should parse multiple options together', () => {
    const options = parseCliArgs([
      'node',
      'cli.js',
      '--port',
      '3001',
      '--host',
      'localhost',
      '--provider',
      'anthropic',
      '--model',
      'claude-3',
      '--log-level',
      'info',
    ])
    expect(options.port).toBe(3001)
    expect(options.host).toBe('localhost')
    expect(options.provider).toBe('anthropic')
    expect(options.model).toBe('claude-3')
    expect(options.logLevel).toBe('info')
  })
})
