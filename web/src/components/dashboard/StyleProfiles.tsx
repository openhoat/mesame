import { Badge, Button, Group, Paper, Stack, Text, Title } from '@mantine/core'
import { FileText, Plus } from 'lucide-react'
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
  const [profile, setProfile] = useState<StyleProfile | null>(null)
  const [generating, setGenerating] = useState(false)

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/style-profile')
      if (response.ok) {
        const data = await response.json()
        if (data?.personaPrompt) {
          setProfile({
            id: '1',
            name: 'Style Profile',
            personaPrompt: data.personaPrompt,
            isActive: true,
            createdAt: new Date().toISOString(),
          })
        }
      }
    } catch (_error) {
      // Failed to fetch profile - will show empty state
    }
  }, [])

  const handleGenerateProfile = async () => {
    try {
      setGenerating(true)
      const response = await fetch('/api/style-profile/generate', {
        method: 'POST',
      })
      if (response.ok) {
        await fetchProfile()
      }
    } catch (_error) {
      // Failed to generate profile
    } finally {
      setGenerating(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={1}>{t('profiles.title')}</Title>
          <Text c="dimmed">{t('profiles.subtitle')}</Text>
        </div>
        <Button
          leftSection={<Plus size={16} />}
          onClick={handleGenerateProfile}
          loading={generating}
        >
          {t('profiles.buttons.generateProfile')}
        </Button>
      </Group>

      {/* Profile Display */}
      {!profile ? (
        <Paper shadow="sm" p="xl" withBorder>
          <Stack align="center" gap="md">
            <FileText size={48} opacity={0.5} />
            <Text size="sm" c="dimmed">
              {t('profiles.emptyState')}
            </Text>
            <Button
              leftSection={<Plus size={16} />}
              onClick={handleGenerateProfile}
              loading={generating}
            >
              {t('profiles.buttons.generateProfile')}
            </Button>
          </Stack>
        </Paper>
      ) : (
        <Paper
          shadow="sm"
          p="lg"
          withBorder
          style={{
            borderColor: 'var(--mantine-color-blue-6)',
            borderWidth: '2px',
            backgroundColor: 'var(--mantine-color-blue-0)',
          }}
        >
          <Stack gap="md">
            <Group justify="space-between">
              <div>
                <Group gap="sm" align="center">
                  <Title order={3}>{profile.name || t('profiles.unnamedProfile')}</Title>
                  <Badge color="blue" size="lg" variant="filled">
                    ✓ {t('profiles.active')}
                  </Badge>
                </Group>
                <Text size="sm" c="dimmed" mt="xs">
                  {t('profiles.generatedFromSources')}
                </Text>
                <Text size="xs" c="dimmed">
                  {t('profiles.activeDescription')}
                </Text>
              </div>
              <Button
                leftSection={<Plus size={16} />}
                onClick={handleGenerateProfile}
                loading={generating}
                variant="light"
              >
                {t('profiles.buttons.regenerate')}
              </Button>
            </Group>

            <Paper p="md" withBorder bg="gray.0">
              <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                {profile.personaPrompt}
              </Text>
            </Paper>
          </Stack>
        </Paper>
      )}
    </Stack>
  )
}
