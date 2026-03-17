import { PDFParse } from 'pdf-parse'

export type SupportedMimeType = 'text/plain' | 'text/markdown' | 'application/pdf'

const SUPPORTED_EXTENSIONS: Record<string, SupportedMimeType> = {
  '.txt': 'text/plain',
  '.md': 'text/markdown',
  '.pdf': 'application/pdf',
}

const SUPPORTED_MIME_TYPES = new Set<string>([
  'text/plain',
  'text/markdown',
  'text/x-markdown',
  'application/pdf',
])

export function isSupportedFile(filename: string, mimetype: string): boolean {
  const ext = getExtension(filename)
  return SUPPORTED_MIME_TYPES.has(mimetype) || ext in SUPPORTED_EXTENSIONS
}

export function getExtension(filename: string): string {
  const dotIndex = filename.lastIndexOf('.')
  if (dotIndex === -1) return ''
  return filename.slice(dotIndex).toLowerCase()
}

export async function extractText(
  buffer: Buffer,
  filename: string,
  mimetype: string
): Promise<string> {
  const ext = getExtension(filename)

  if (mimetype === 'application/pdf' || ext === '.pdf') {
    return extractPdfText(buffer)
  }

  // Text-based files (MD, TXT)
  return buffer.toString('utf-8')
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) })
  const result = await parser.getText()
  await parser.destroy()
  return result.text.trim()
}

export function deriveTitleFromFilename(filename: string): string {
  const ext = getExtension(filename)
  const name = ext ? filename.slice(0, -ext.length) : filename
  return name.replace(/[_-]/g, ' ').trim()
}
