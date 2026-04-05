import {
  Button,
  Group,
  NumberInput,
  Paper,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { AlertCircle, RotateCcw, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { API } from '@/config/api'
import i18n from '../../i18n'

interface ServerConfig {
  llmHost: string
  llmPort: number
  llmUrl: string
  logLevel: string
  language: string | null
  optimizationsEnabled: boolean
  slidingWindowSize: number
}

export const ServerConfig = () => {
  const { t } = useTranslation()
  const [config, setConfig] = useState<ServerConfig>({
    llmHost: 'localhost',
    llmPort: 3001,
    llmUrl: 'http://localhost:3001',
    logLevel: 'info',
    language: null,
    optimizationsEnabled: false,
    slidingWindowSize: 10,
  })

  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [_configLoaded, setConfigLoaded] = useState(false)

  // Update i18n language when config.language changes
  useEffect(() => {
    if (config.language && i18n.language !== config.language) {
      i18n.changeLanguage(config.language)
    }
  }, [config.language])

  useEffect(() => {
    // Load current config from server
    const loadConfig = async () => {
      try {
        const response = await fetch(API.config())
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        // biome-ignore lint/suspicious/noExplicitAny: Config structure is dynamic
        const serverConfig: any = await response.json()

        setConfig(prev => ({
          ...prev,
          llmHost: serverConfig.llmHost as string,
          llmPort: serverConfig.llmPort as number,
          llmUrl: serverConfig.llmUrl as string,
          logLevel: serverConfig.logLevel as string,
          language: serverConfig.language as string | null,
          optimizationsEnabled: serverConfig.optimizationsEnabled as boolean,
          slidingWindowSize: serverConfig.slidingWindowSize as number,
        }))
        setConfigLoaded(true)
      } catch (_error) {
        // Silently fail - config will use defaults
      }
    }

    loadConfig()
  }, [])

  const handleChange = (key: keyof ServerConfig, value: string | number | boolean | null) => {
    setConfig(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Save settings to server
      const response = await fetch(API.settings(), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: config.language,
          llmUrl: config.llmUrl,
          logLevel: config.logLevel,
          optimizationsEnabled: config.optimizationsEnabled,
          slidingWindowSize: config.slidingWindowSize,
        }),
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      setHasChanges(false)
    } catch (_error) {
      // Failed to save config
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    // Reset to defaults
    setConfig({
      llmHost: 'localhost',
      llmPort: 3001,
      llmUrl: 'http://localhost:3001',
      logLevel: 'info',
      language: null,
      optimizationsEnabled: false,
      slidingWindowSize: 10,
    })
    setHasChanges(true)
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={1}>{t('config.title')}</Title>
          <Text c="dimmed">{t('config.subtitle')}</Text>
        </div>
        {hasChanges && (
          <Group gap="xs">
            <Group
              gap={4}
              style={{
                padding: '4px 12px',
                border: '1px solid var(--mantine-color-default-border)',
                borderRadius: 'var(--mantine-radius-default)',
              }}
            >
              <AlertCircle size={14} />
              <Text size="sm">{t('common.unsavedChanges')}</Text>
            </Group>
            <Button onClick={handleSave} loading={isSaving} leftSection={<Save size={16} />}>
              {t('config.buttons.saveChanges')}
            </Button>
          </Group>
        )}
      </Group>

      <Paper shadow="sm" p="md" withBorder>
        <Stack gap="md">
          <div>
            <Title order={3}>{t('config.llmSource.title')}</Title>
            <Text size="sm" c="dimmed">
              {t('config.llmSource.subtitle')}
            </Text>
          </div>
          <Text size="sm">
            {t('config.llmSource.description')}{' '}
            <Text component="span" c="blue" style={{ textDecoration: 'underline' }}>
              <Link to="/dashboard/providers">{t('config.llmSource.link')}</Link>
            </Text>
          </Text>
        </Stack>
      </Paper>

      <Group>
        {/* Proxy Settings */}
        <Paper shadow="sm" p="md" withBorder style={{ flex: 1 }}>
          <Stack gap="md">
            <div>
              <Title order={3}>{t('config.serverSettings.title')}</Title>
              <Text size="sm" c="dimmed">
                {t('config.serverSettings.subtitle')}
              </Text>
            </div>

            <TextInput
              label={t('config.serverSettings.proxyUrl')}
              description={t('config.serverSettings.proxyUrlDescription')}
              value={config.llmUrl}
              onChange={e => handleChange('llmUrl', e.currentTarget.value)}
              placeholder="http://localhost:3001"
            />

            <Select
              label={t('config.serverSettings.logLevel')}
              description={t('config.serverSettings.logLevelDescription')}
              value={config.logLevel}
              onChange={value => value && handleChange('logLevel', value)}
              data={[
                { value: 'error', label: t('config.logLevels.error') },
                { value: 'warn', label: t('config.logLevels.warn') },
                { value: 'info', label: t('config.logLevels.info') },
                { value: 'debug', label: t('config.logLevels.debug') },
              ]}
            />

            <Select
              label={t('config.serverSettings.language')}
              description={t('config.serverSettings.languageDescription')}
              value={config.language ?? ''}
              onChange={value => handleChange('language', value || null)}
              data={[
                { value: '', label: t('languages.none') },
                { value: 'en', label: t('languages.en') },
                { value: 'fr', label: t('languages.fr') },
                { value: 'es', label: t('languages.es') },
                { value: 'de', label: t('languages.de') },
                { value: 'it', label: t('languages.it') },
                { value: 'pt', label: t('languages.pt') },
                { value: 'ru', label: t('languages.ru') },
                { value: 'ja', label: t('languages.ja') },
                { value: 'zh', label: t('languages.zh') },
                { value: 'ko', label: t('languages.ko') },
              ]}
            />
          </Stack>
        </Paper>

        {/* Performance Settings */}
        <Paper shadow="sm" p="md" withBorder style={{ flex: 1 }}>
          <Stack gap="md">
            <div>
              <Title order={3}>{t('config.performance.title')}</Title>
              <Text size="sm" c="dimmed">
                {t('config.performance.subtitle')}
              </Text>
            </div>

            <Switch
              label={t('config.performance.optimizations')}
              description={t('config.performance.optimizationsDescription')}
              checked={config.optimizationsEnabled}
              onChange={e => handleChange('optimizationsEnabled', e.currentTarget.checked)}
            />

            <NumberInput
              label={t('config.performance.slidingWindow')}
              description={t('config.performance.slidingWindowDescription')}
              value={config.slidingWindowSize}
              onChange={value => handleChange('slidingWindowSize', Number(value))}
              min={1}
              max={100}
              disabled={!config.optimizationsEnabled}
            />
          </Stack>
        </Paper>
      </Group>

      {/* Danger Zone */}
      <Paper
        shadow="sm"
        p="md"
        withBorder
        style={{ borderColor: 'var(--mantine-color-red-6)', maxWidth: '50%' }}
      >
        <Stack gap="md">
          <div>
            <Title order={3} c="red">
              {t('config.dangerZone.title')}
            </Title>
            <Text size="sm" c="dimmed">
              {t('config.dangerZone.subtitle')}
            </Text>
          </div>

          <Button color="red" leftSection={<RotateCcw size={16} />} onClick={handleReset}>
            {t('config.dangerZone.resetButton')}
          </Button>
        </Stack>
      </Paper>
    </Stack>
  )
}
