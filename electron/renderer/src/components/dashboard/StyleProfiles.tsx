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

interface StyleProfile {
  id: string
  name: string
  personaPrompt: string
  isActive: boolean
  createdAt: string
  lastUsed?: string
}

export function StyleProfiles() {
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
          <Title order={1}>Style Profiles</Title>
          <Text c="dimmed">Manage your writing style personas</Text>
        </div>
        <Button leftSection={<Plus size={16} />} onClick={() => setEditingId('new')}>
          New Profile
        </Button>
      </Group>

      {/* Create/Edit Form */}
      {editingId && (
        <Paper shadow="sm" p="md" withBorder>
          <Stack gap="md">
            <div>
              <Title order={3}>{editingId === 'new' ? 'Create New Profile' : 'Edit Profile'}</Title>
              <Text size="sm" c="dimmed">
                Define your writing style and persona
              </Text>
            </div>

            <TextInput
              label="Profile Name"
              value={editForm.name}
              onChange={e => setEditForm({ ...editForm, name: e.target.value })}
              placeholder="e.g., Technical Writer, Casual Blogger"
            />

            <Textarea
              label="Persona Prompt"
              value={editForm.personaPrompt}
              onChange={e => setEditForm({ ...editForm, personaPrompt: e.target.value })}
              placeholder="Describe the writing style, tone, and structure..."
              minRows={5}
            />

            <Group gap="xs">
              <Button leftSection={<CheckCircle2 size={16} />} onClick={handleSave}>
                Save
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  setEditingId(null)
                  setEditForm({ name: '', personaPrompt: '' })
                }}
              >
                Cancel
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
                  No style profiles yet. Create one to get started.
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
                    <Title order={4}>{profile.name || 'Unnamed Profile'}</Title>
                    {profile.isActive && <Badge color="blue">Active</Badge>}
                  </Group>

                  <Text size="sm" c="dimmed" lineClamp={3}>
                    {profile.personaPrompt || 'No description'}
                  </Text>

                  <Group gap="xs">
                    {!profile.isActive && (
                      <Button size="sm" onClick={() => handleActivate(profile.id)}>
                        Activate
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="default"
                      leftSection={<Edit size={14} />}
                      onClick={() => setEditingId(profile.id)}
                    >
                      Edit
                    </Button>
                    <Button size="sm" color="red" leftSection={<Trash2 size={14} />}>
                      Delete
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
