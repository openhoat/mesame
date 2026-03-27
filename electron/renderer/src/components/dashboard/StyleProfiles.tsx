import {
  Badge,
  Button,
  Grid,
  Group,
  Paper,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core'
import { CheckCircle2, Edit, FileText, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface StyleProfile {
  id: string
  name: string
  personaPrompt: string
  isActive: boolean
  createdAt: string
  lastUsed?: string
}

export function StyleProfiles() {
  const { t } = useTranslation()
  const [profiles, setProfiles] = useState<StyleProfile[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', personaPrompt: '' })

  const fetchProfiles = useCallback(async () => {
    try {
      const response = await fetch('/v1/style-profile')
      if (response.ok) {
        const data = await response.json()
        // Transform to array if single profile
        const profilesList = Array.isArray(data) ? data : data.personaPrompt ? [data] : []
        setProfiles(profilesList)
      }
    } catch (_error) {
      // Failed to fetch profiles - will show empty state
    }
  }, [])

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  const handleSave = async () => {
    try {
      const response = await fetch('/v1/style-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        await fetchProfiles()
        setEditingId(null)
        setEditForm({ name: '', personaPrompt: '' })
      }
    } catch (_error) {
      // Failed to save profile
    }
  }

  const handleActivate = async (_id: string) => {
    // TODO: Implement activate endpoint
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={1}>{t('profiles.title')}</Title>
          <Text c="dimmed">{t('profiles.subtitle')}</Text>
        </div>
        <Button leftSection={<Plus size={16} />} onClick={() => setEditingId('new')}>
          {t('profiles.newProfile')}
        </Button>
      </Group>

      {/* Create/Edit Form */}
      {editingId && (
        <Paper shadow="sm" p="md" withBorder>
          <Stack gap="md">
            <div>
              <Title order={3}>
                {editingId === 'new' ? t('profiles.createNewProfile') : t('profiles.editProfile')}
              </Title>
              <Text size="sm" c="dimmed">
                {t('profiles.defineStyle')}
              </Text>
            </div>

            <TextInput
              label={t('profiles.nameLabel')}
              value={editForm.name}
              onChange={e => setEditForm({ ...editForm, name: e.target.value })}
              placeholder={t('profiles.namePlaceholder')}
            />

            <Textarea
              label={t('profiles.promptLabel')}
              value={editForm.personaPrompt}
              onChange={e => setEditForm({ ...editForm, personaPrompt: e.target.value })}
              placeholder={t('profiles.promptPlaceholder')}
              minRows={5}
            />

            <Group gap="xs">
              <Button leftSection={<CheckCircle2 size={16} />} onClick={handleSave}>
                {t('profiles.buttons.save')}
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  setEditingId(null)
                  setEditForm({ name: '', personaPrompt: '' })
                }}
              >
                {t('profiles.buttons.cancel')}
              </Button>
            </Group>
          </Stack>
        </Paper>
      )}

      {/* Profiles List */}
      <Grid>
        {profiles.length === 0 ? (
          <Grid.Col span={12}>
            <Paper shadow="sm" p="xl" withBorder>
              <Stack align="center" gap="md">
                <FileText size={48} opacity={0.5} />
                <Text size="sm" c="dimmed">
                  {t('profiles.emptyState')}
                </Text>
              </Stack>
            </Paper>
          </Grid.Col>
        ) : (
          profiles.map(profile => (
            <Grid.Col key={profile.id} span={{ base: 12, md: 6 }}>
              <Paper
                shadow="sm"
                p="md"
                withBorder
                style={
                  profile.isActive ? { borderColor: 'var(--mantine-color-blue-6)' } : undefined
                }
              >
                <Stack gap="md">
                  <Group justify="space-between">
                    <Title order={4}>{profile.name || t('profiles.unnamedProfile')}</Title>
                    {profile.isActive && <Badge color="blue">{t('profiles.active')}</Badge>}
                  </Group>

                  <Text size="sm" c="dimmed" lineClamp={3}>
                    {profile.personaPrompt || t('profiles.noDescription')}
                  </Text>

                  <Group gap="xs">
                    {!profile.isActive && (
                      <Button size="sm" onClick={() => handleActivate(profile.id)}>
                        {t('profiles.buttons.activate')}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="default"
                      leftSection={<Edit size={14} />}
                      onClick={() => setEditingId(profile.id)}
                    >
                      {t('profiles.buttons.edit')}
                    </Button>
                    <Button size="sm" color="red" leftSection={<Trash2 size={14} />}>
                      {t('profiles.buttons.delete')}
                    </Button>
                  </Group>
                </Stack>
              </Paper>
            </Grid.Col>
          ))
        )}
      </Grid>
    </Stack>
  )
}
