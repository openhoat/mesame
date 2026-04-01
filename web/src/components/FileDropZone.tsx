import { Stack, Text } from '@mantine/core'
import { Upload } from 'lucide-react'
import { type DragEvent, type ReactNode, useState } from 'react'

interface FileDropZoneProps {
  onDrop: (files: File[]) => void
  accept?: string
  multiple?: boolean
  disabled?: boolean
  children: ReactNode
}

export const FileDropZone = ({
  onDrop,
  accept,
  multiple = true,
  disabled = false,
  children,
}: FileDropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled && e.dataTransfer.types.includes('Files')) {
      setIsDragging(true)
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.currentTarget === e.target) {
      setIsDragging(false)
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (disabled) return

    const { files } = e.dataTransfer
    if (!files || files.length === 0) return

    const fileArray = Array.from(files) as File[]

    // Filter by accepted file types if specified
    const filteredFiles = accept
      ? fileArray.filter((file: File) => {
          const acceptTypes = accept.split(',').map(t => t.trim())
          return acceptTypes.some(type => {
            if (type.startsWith('.')) {
              return file.name.toLowerCase().endsWith(type.toLowerCase())
            }
            return file.type.match(type.replace('*', '.*'))
          })
        })
      : fileArray

    const filesToUpload = multiple ? filteredFiles : filteredFiles.slice(0, 1)

    if (filesToUpload.length > 0) {
      onDrop(filesToUpload)
    }
  }

  return (
    <section
      aria-label="File drop zone"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{ position: 'relative', width: '100%' }}
    >
      {children}

      {isDragging && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'var(--mantine-color-blue-light)',
            border: '2px dashed var(--mantine-color-blue-filled)',
            borderRadius: 'var(--mantine-radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        >
          <Stack align="center" gap="sm">
            <Upload size={48} color="var(--mantine-color-blue-filled)" />
            <Text size="lg" fw={600} c="blue">
              Drop files here
            </Text>
          </Stack>
        </div>
      )}
    </section>
  )
}
