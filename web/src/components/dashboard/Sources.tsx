import {
  ActionIcon,
  Badge,
  Button,
  FileButton,
  Grid,
  Group,
  Loader,
  Modal,
  Paper,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core'
import { CheckCircle2, FileText, Plus, Sparkles, Trash2, Upload } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface Source {
  id: string
  title: string
  content: string
  createdAt: string
}

export function Sources() {
  const { t } = useTranslation()
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(false)
  const [generatingProfile, setGeneratingProfile] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'view'>('create')
  const [selectedSource, setSelectedSource] = useState<Source | null>(null)
  const [editForm, setEditForm] = useState({ title: '', content: '' })
  const [fetchError, setFetchError] = useState<string | null>(null)
  const resetRef = useRef<() => void>(null)

  const fetchSources = useCallback(async () => {
    setFetchError(null)

    try {
      setLoading(true)

      const healthController = new AbortController()
      const healthTimeout = setTimeout(() => healthController.abort(), 2000)

      const _healthCheck = await fetch('/health', {
        signal: healthController.signal,
      })
        .catch(_err => {
          throw new Error('Server not reachable')
        })
        .finally(() => clearTimeout(healthTimeout))

      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
      }, 5000)

      const fetchPromise = fetch('/api/sources', {
        signal: controller.signal,
      })

      const response = await fetchPromise
      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()

        setSources(Array.isArray(data) ? data : [])
        setFetchError(null)
      } else {
        const errorText = await response.text()

        setFetchError(`Error ${response.status}: ${errorText}`)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)

      setFetchError(errorMsg)
      setSources([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSources()
  }, [fetchSources])

  const handleFileUpload = async (file: File | null) => {
    if (!file) return

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('file', file)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s for uploads

      const response = await fetch('/api/sources/import', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (response.ok) {
        await fetchSources()
        resetRef.current?.()
      }
    } catch (_error) {
      // Silently handle upload errors
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSource = async () => {
    if (!editForm.title.trim() || !editForm.content.trim()) return

    try {
      setLoading(true)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (response.ok) {
        await fetchSources()
        setModalOpen(false)
        setEditForm({ title: '', content: '' })
      }
    } catch (_error) {
      // Silently handle create errors
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSource = async (id: string) => {
    try {
      setLoading(true)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(`/api/sources/${id}`, {
        method: 'DELETE',
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (response.ok || response.status === 204) {
        await fetchSources()
      }
    } catch (_error) {
      // Silently handle delete errors
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateProfile = async (_sourceId: string) => {
    try {
      setGeneratingProfile(_sourceId)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60s for AI generation

      const response = await fetch('/api/style-profile/generate', {
        method: 'POST',
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (response.ok) {
        // Profile generated successfully from all sources
      }
    } catch (_error) {
      // Silently handle profile generation errors
    } finally {
      setGeneratingProfile(null)
    }
  }

  const openViewModal = (source: Source) => {
    setSelectedSource(source)
    setModalMode('view')
    setModalOpen(true)
  }

  const openCreateModal = () => {
    setSelectedSource(null)
    setModalMode('create')
    setEditForm({ title: '', content: '' })
    setModalOpen(true)
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={1}>{t('sources.title')}</Title>
          <Text c="dimmed">{t('sources.subtitle')}</Text>
        </div>
        <Group gap="xs">
          <FileButton
            resetRef={resetRef}
            onChange={handleFileUpload}
            accept=".txt,.md,.pdf,text/plain,text/markdown,application/pdf"
          >
            {props => (
              <Button {...props} leftSection={<Upload size={16} />} loading={loading}>
                {t('sources.buttons.upload')}
              </Button>
            )}
          </FileButton>
          <Button leftSection={<Plus size={16} />} onClick={openCreateModal}>
            {t('sources.buttons.create')}
          </Button>
        </Group>
      </Group>

      {/* Sources List */}
      {fetchError && (
        <Paper shadow="sm" p="xl" withBorder bg="red.1">
          <Stack align="center" gap="md">
            <Text size="sm" c="red">
              ❌ Error: {fetchError}
            </Text>
            <Button size="sm" onClick={fetchSources}>
              Retry
            </Button>
          </Stack>
        </Paper>
      )}
      {loading && sources.length === 0 ? (
        <Paper shadow="sm" p="xl" withBorder>
          <Stack align="center" gap="md">
            <Loader size="md" />
            <Text size="sm" c="dimmed">
              {t('sources.loading')}
            </Text>
            <Text size="xs" c="dimmed">
              Check console for debug logs...
            </Text>
          </Stack>
        </Paper>
      ) : sources.length === 0 ? (
        <Paper shadow="sm" p="xl" withBorder>
          <Stack align="center" gap="md">
            <FileText size={48} opacity={0.5} />
            <Text size="sm" c="dimmed">
              {t('sources.emptyState')}
            </Text>
          </Stack>
        </Paper>
      ) : (
        <Grid>
          {sources.map(source => (
            <Grid.Col key={source.id} span={{ base: 12, md: 6 }}>
              <Paper shadow="sm" p="md" withBorder>
                <Stack gap="md">
                  <Group justify="space-between" align="flex-start">
                    <div style={{ flex: 1 }}>
                      <Title order={4} lineClamp={1}>
                        {source.title}
                      </Title>
                      <Badge size="xs" color="gray" variant="light">
                        {new Date(source.createdAt).toLocaleDateString()}
                      </Badge>
                    </div>
                    <ActionIcon
                      size="sm"
                      color="red"
                      variant="subtle"
                      onClick={() => handleDeleteSource(source.id)}
                      disabled={loading}
                    >
                      <Trash2 size={14} />
                    </ActionIcon>
                  </Group>

                  <Text
                    size="sm"
                    c="dimmed"
                    lineClamp={3}
                    style={{ cursor: 'pointer' }}
                    onClick={() => openViewModal(source)}
                  >
                    {source.content}
                  </Text>

                  <Group gap="xs">
                    <Button
                      size="sm"
                      variant="light"
                      leftSection={<Sparkles size={14} />}
                      onClick={() => handleGenerateProfile(source.id)}
                      loading={generatingProfile === source.id}
                      disabled={loading || generatingProfile !== null}
                    >
                      {t('sources.buttons.generateProfile')}
                    </Button>
                    <Button size="sm" variant="default" onClick={() => openViewModal(source)}>
                      {t('sources.buttons.view')}
                    </Button>
                  </Group>
                </Stack>
              </Paper>
            </Grid.Col>
          ))}
        </Grid>
      )}

      {/* Create/View Modal */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          modalMode === 'create'
            ? t('sources.modal.createTitle')
            : t('sources.modal.viewTitle', { title: selectedSource?.title })
        }
        size="lg"
      >
        <Stack gap="md">
          {modalMode === 'create' ? (
            <>
              <TextInput
                label={t('sources.modal.titleLabel')}
                placeholder={t('sources.modal.titlePlaceholder')}
                value={editForm.title}
                onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                required
              />
              <Textarea
                label={t('sources.modal.contentLabel')}
                placeholder={t('sources.modal.contentPlaceholder')}
                value={editForm.content}
                onChange={e => setEditForm({ ...editForm, content: e.target.value })}
                minRows={10}
                required
              />
              <Group gap="xs">
                <Button
                  leftSection={<CheckCircle2 size={16} />}
                  onClick={handleCreateSource}
                  loading={loading}
                  disabled={!editForm.title.trim() || !editForm.content.trim()}
                >
                  {t('sources.buttons.create')}
                </Button>
                <Button variant="default" onClick={() => setModalOpen(false)}>
                  {t('common.cancel')}
                </Button>
              </Group>
            </>
          ) : (
            <>
              <Textarea value={selectedSource?.content || ''} minRows={15} readOnly />
              <Button variant="default" onClick={() => setModalOpen(false)}>
                {t('common.close')}
              </Button>
            </>
          )}
        </Stack>
      </Modal>
    </Stack>
  )
}
