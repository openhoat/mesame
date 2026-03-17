import { describe, expect, test, vi } from 'vitest'
import {
  deriveTitleFromFilename,
  extractText,
  getExtension,
  isSupportedFile,
} from './fileParser.js'

vi.mock('pdf-parse', () => ({
  PDFParse: vi.fn().mockImplementation(() => ({
    getText: vi.fn().mockResolvedValue({ text: 'Extracted PDF content\n' }),
    destroy: vi.fn().mockResolvedValue(undefined),
  })),
}))

describe('fileParser', () => {
  describe('getExtension', () => {
    test('should return extension for standard filenames', () => {
      expect(getExtension('document.txt')).toBe('.txt')
      expect(getExtension('readme.md')).toBe('.md')
      expect(getExtension('report.pdf')).toBe('.pdf')
    })

    test('should return lowercase extension', () => {
      expect(getExtension('file.TXT')).toBe('.txt')
      expect(getExtension('file.PDF')).toBe('.pdf')
    })

    test('should return empty string for files without extension', () => {
      expect(getExtension('noextension')).toBe('')
    })

    test('should handle filenames with multiple dots', () => {
      expect(getExtension('my.document.txt')).toBe('.txt')
    })
  })

  describe('isSupportedFile', () => {
    test('should accept supported MIME types', () => {
      expect(isSupportedFile('file.txt', 'text/plain')).toBe(true)
      expect(isSupportedFile('file.md', 'text/markdown')).toBe(true)
      expect(isSupportedFile('file.md', 'text/x-markdown')).toBe(true)
      expect(isSupportedFile('file.pdf', 'application/pdf')).toBe(true)
    })

    test('should accept files by extension even with wrong MIME type', () => {
      expect(isSupportedFile('file.txt', 'application/octet-stream')).toBe(true)
      expect(isSupportedFile('file.md', 'application/octet-stream')).toBe(true)
      expect(isSupportedFile('file.pdf', 'application/octet-stream')).toBe(true)
    })

    test('should reject unsupported files', () => {
      expect(isSupportedFile('file.jpg', 'image/jpeg')).toBe(false)
      expect(isSupportedFile('file.docx', 'application/vnd.openxmlformats')).toBe(false)
    })
  })

  describe('extractText', () => {
    test('should extract text from TXT files', async () => {
      const buffer = Buffer.from('Hello, world!')
      const result = await extractText(buffer, 'test.txt', 'text/plain')
      expect(result).toBe('Hello, world!')
    })

    test('should extract text from MD files', async () => {
      const buffer = Buffer.from('# Title\n\nContent')
      const result = await extractText(buffer, 'readme.md', 'text/markdown')
      expect(result).toBe('# Title\n\nContent')
    })

    test('should extract text from PDF files', async () => {
      const buffer = Buffer.from('fake-pdf-data')
      const result = await extractText(buffer, 'report.pdf', 'application/pdf')
      expect(result).toBe('Extracted PDF content')
    })

    test('should detect PDF by extension when MIME type is generic', async () => {
      const buffer = Buffer.from('fake-pdf-data')
      const result = await extractText(buffer, 'report.pdf', 'application/octet-stream')
      expect(result).toBe('Extracted PDF content')
    })
  })

  describe('deriveTitleFromFilename', () => {
    test('should remove extension and clean up filename', () => {
      expect(deriveTitleFromFilename('my-document.txt')).toBe('my document')
      expect(deriveTitleFromFilename('hello_world.md')).toBe('hello world')
      expect(deriveTitleFromFilename('report.pdf')).toBe('report')
    })

    test('should handle filenames without extension', () => {
      expect(deriveTitleFromFilename('noextension')).toBe('noextension')
    })

    test('should handle filenames with multiple separators', () => {
      expect(deriveTitleFromFilename('my-cool_document.txt')).toBe('my cool document')
    })
  })
})
