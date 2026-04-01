import {
  ActionIcon,
  Badge,
  Button,
  Checkbox,
  Divider,
  Group,
  Modal,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Check, Edit, FileText, Loader2, Plus, RefreshCw, Trash2, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ModelSelector } from '@/components/ModelSelector'

interface Source {
  id: string
  title: string
}

interface StyleProfile {
  id: string
  name: string
  personaPrompt: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  sources: Source[]
}

export function StyleProfiles() {
  const { t } = useTranslation()
  const [profiles, setProfiles] = useState<StyleProfile[]>([])
  const [sources, setSources] = useState<Source[]>([])
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false)
  const [editingProfile, setEditingProfile] = useState<StyleProfile | null>(null)
  const [profileName, setProfileName] = useState('')
  const [selectedSources, setSelectedSources] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState<string | null>(null)

  const fetchProfiles = useCallback(async () => {
    try {
      const response = await fetch('/api/style-profile')
      if (response.ok) {
        const data = await response.json()
        setProfiles(data)
      }
    } catch (_error) {
      // Failed to fetch profiles
    }
  }, [])

  const fetchSources = useCallback(async () => {
    try {
      const response = await fetch('/api/sources')
      if (response.ok) {
        const data = await response.json()
        setSources(Array.isArray(data) ? data : [])
      }
    } catch (_error) {
      // Failed to fetch sources
    }
  }, [])

  useEffect(() => {
    fetchProfiles()
    fetchSources()
  }, [fetchProfiles, fetchSources])

  const handleCreateProfile = () => {
    setEditingProfile(null)
    setProfileName('')
    setSelectedSources([])
    openModal()
  }

  const handleEditProfile = (profile: StyleProfile) => {
    setEditingProfile(profile)
    setProfileName(profile.name)
    setSelectedSources(profile.sources.map(s => s.id))
    openModal()
  }

  const handleSaveProfile = async () => {
    if (!profileName.trim() || selectedSources.length === 0) return

    setSaving(true)
    try {
      const url = editingProfile ? `/api/style-profile/${editingProfile.id}` : '/api/style-profile'
      const method = editingProfile ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileName,
          sourceIds: selectedSources,
          modelId: selectedModel,
        }),
      })

      if (response.ok) {
        await fetchProfiles()
        closeModal()
      }
    } catch (_error) {
      // Failed to save profile
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProfile = async (id: string) => {
    if (!confirm(t('profiles.confirmDelete') || 'Delete this profile?')) return

    try {
      const response = await fetch(`/api/style-profile/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchProfiles()
      }
    } catch (_error) {
      // Failed to delete profile
    }
  }

  const handleActivateProfile = async (id: string) => {
    try {
      const response = await fetch(`/api/style-profile/${id}/activate`, {
        method: 'POST',
      })

      if (response.ok) {
        await fetchProfiles()
      }
    } catch (_error) {
      // Failed to activate profile
    }
  }

  const handleRegenerateProfile = async (id: string) => {
    setRegeneratingId(id)
    try {
      const response = await fetch(`/api/style-profile/${id}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId: selectedModel }),
      })

      if (response.ok) {
        await fetchProfiles()
      }
    } catch (_error) {
      // Failed to regenerate profile
    } finally {
      setRegeneratingId(null)
    }
  }

  const toggleSource = (sourceId: string) => {
    setSelectedSources(prev =>
      prev.includes(sourceId) ? prev.filter(id => id !== sourceId) : [...prev, sourceId]
    )
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={1}>{t('profiles.title')}</Title>
          <Text c="dimmed">{t('profiles.subtitle')}</Text>
        </div>
        <Button leftSection={<Plus size={16} />} onClick={handleCreateProfile}>
          {t('profiles.buttons.createProfile') || 'Create Profile'}
        </Button>
      </Group>

      {/* Profiles List */}
      {profiles.length === 0 ? (
        <Paper shadow="sm" p="xl" withBorder>
          <Stack align="center" gap="md">
            <FileText size={48} opacity={0.5} />
            <Text size="sm" c="dimmed">
              {t('profiles.emptyState')}
            </Text>
            <Button leftSection={<Plus size={16} />} onClick={handleCreateProfile}>
              {t('profiles.buttons.createProfile') || 'Create Profile'}
            </Button>
          </Stack>
        </Paper>
      ) : (
        <Stack gap="md">
          {profiles.map(profile => (
            <Paper key={profile.id} shadow="sm" p="lg" withBorder>
              <Stack gap="md">
                <Group justify="space-between">
                  <div>
                    <Group gap="sm" align="center">
                      <Title order={3}>{profile.name}</Title>
                      {profile.isActive && (
                        <Badge
                          color="green"
                          size="lg"
                          variant="filled"
                          leftSection={<Check size={14} />}
                        >
                          {t('profiles.active') || 'Active'}
                        </Badge>
                      )}
                    </Group>
                    <Text size="sm" c="dimmed" mt="xs">
                      {profile.sources.length} {t('profiles.sources') || 'sources'} •{' '}
                      {new Date(profile.updatedAt).toLocaleDateString()}
                    </Text>
                  </div>
                  <Group gap="xs">
                    {!profile.isActive && (
                      <Button
                        size="sm"
                        variant="light"
                        leftSection={<Check size={14} />}
                        onClick={() => handleActivateProfile(profile.id)}
                      >
                        {t('profiles.buttons.activate') || 'Activate'}
                      </Button>
                    )}
                    <ActionIcon
                      variant="light"
                      color="blue"
                      size="lg"
                      onClick={() => handleRegenerateProfile(profile.id)}
                      loading={regeneratingId === profile.id}
                    >
                      {regeneratingId === profile.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <RefreshCw size={16} />
                      )}
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="gray"
                      size="lg"
                      onClick={() => handleEditProfile(profile)}
                    >
                      <Edit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="red"
                      size="lg"
                      onClick={() => handleDeleteProfile(profile.id)}
                    >
                      <Trash2 size={16} />
                    </ActionIcon>
                  </Group>
                </Group>

                <Paper p="md" withBorder>
                  <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                    {profile.personaPrompt}
                  </Text>
                </Paper>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      {/* Create/Edit Modal */}
      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title={editingProfile ? t('profiles.editProfile') : t('profiles.createProfile')}
        size="lg"
      >
        <Stack gap="md">
          <TextInput
            label={t('profiles.profileName') || 'Profile Name'}
            placeholder={t('profiles.profileNamePlaceholder') || 'Enter profile name'}
            value={profileName}
            onChange={e => setProfileName(e.target.value)}
            required
          />

          <div>
            <Text size="sm" fw={500} mb="xs">
              {t('profiles.selectSources') || 'Select Sources'}
            </Text>
            {sources.length === 0 ? (
              <Text size="sm" c="dimmed">
                {t('profiles.noSources') || 'No sources available'}
              </Text>
            ) : (
              <Stack gap="xs">
                {sources.map(source => (
                  <Checkbox
                    key={source.id}
                    label={source.title}
                    checked={selectedSources.includes(source.id)}
                    onChange={() => toggleSource(source.id)}
                  />
                ))}
              </Stack>
            )}
          </div>

          <Divider />

          <ModelSelector
            value={selectedModel}
            onChange={setSelectedModel}
            label={t('profiles.selectModel') || 'Model for generation'}
            placeholder={t('profiles.selectModelPlaceholder') || 'Select model'}
            size="sm"
          />

          <Divider />

          <Group justify="flex-end">
            <Button variant="default" onClick={closeModal} leftSection={<X size={16} />}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSaveProfile}
              loading={saving}
              disabled={!profileName.trim() || selectedSources.length === 0}
              leftSection={<Check size={16} />}
            >
              {editingProfile ? t('common.save') : t('common.create')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
}
