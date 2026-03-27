import {
  Button,
  Grid,
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

type LLMProvider = 'openai' | 'anthropic' | 'ollama'

interface ServerConfig {
  port: number
  model: string
  targetBaseUrl: string
  targetApiKey: string
  logLevel: string
  language: string
  cacheEnabled: boolean
  maxTokens: number
}

const PROVIDER_DEFAULTS: Record<LLMProvider, { url: string; model: string }> = {
  openai: { url: 'https://api.openai.com', model: 'gpt-4o-mini' },
  anthropic: { url: 'https://api.anthropic.com', model: 'claude-3-5-sonnet-20241022' },
  ollama: { url: 'http://localhost:11434', model: 'llama2' },
}

// Detect provider from URL
function detectProvider(url: string): LLMProvider {
  const lowerUrl = url.toLowerCase()
  if (lowerUrl.includes('anthropic.com')) return 'anthropic'
  if (
    lowerUrl.includes('localhost') ||
    lowerUrl.includes('127.0.0.1') ||
    lowerUrl.includes('ollama')
  )
    return 'ollama'
  return 'openai'
}

export function ServerConfig() {
  const { t } = useTranslation()
  const [config, setConfig] = useState<ServerConfig>({
    port: 3000,
    model: 'gpt-4o-mini',
    targetBaseUrl: 'https://api.openai.com',
    targetApiKey: '',
    logLevel: 'info',
    language: 'en',
    cacheEnabled: true,
    maxTokens: 4096,
  })

  const [provider, setProvider] = useState<LLMProvider>('openai')
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Update detected provider when URL changes
  useEffect(() => {
    setProvider(detectProvider(config.targetBaseUrl))
  }, [config.targetBaseUrl])

  useEffect(() => {
    // Load current config from server (works in both Electron and web mode)
    const loadConfig = async () => {
      try {
        // Try IPC first (Electron mode)
        // biome-ignore lint/suspicious/noExplicitAny: Config structure is dynamic
        let serverConfig: any
        if (window.electronAPI) {
          serverConfig = await window.electronAPI.getConfig()
        } else {
          const response = await fetch('http://localhost:3000/api/config')
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }
          serverConfig = await response.json()
        }

        setConfig(prev => {
          const newConfig = {
            ...prev,
            port: serverConfig.port as number,
            model: serverConfig.model as string,
            targetBaseUrl: serverConfig.targetBaseUrl as string,
            logLevel: serverConfig.logLevel as string,
            language: serverConfig.language as string,
            // Don't load API key from server (security)
            targetApiKey: serverConfig.hasApiKey ? '••••••••' : '',
          }

          return newConfig
        })
      } catch (_error) {
        // Silently fail - config will use defaults
      }
    }

    loadConfig()
  }, [])

  const handleChange = (key: keyof ServerConfig, value: string | number | boolean) => {
    setConfig(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleProviderChange = (newProvider: string | null) => {
    if (!newProvider) return
    const provider = newProvider as LLMProvider
    setProvider(provider)
    const defaults = PROVIDER_DEFAULTS[provider]
    setConfig(prev => ({
      ...prev,
      targetBaseUrl: defaults.url,
      model: defaults.model,
      // Clear API key when switching to Ollama (not required)
      targetApiKey: provider === 'ollama' ? '' : prev.targetApiKey,
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // TODO: Implement config save endpoint
      await new Promise(resolve => setTimeout(resolve, 1000)) // Mock delay
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
      port: 3000,
      model: 'gpt-4o-mini',
      targetBaseUrl: 'https://api.openai.com',
      targetApiKey: '',
      logLevel: 'info',
      language: 'en',
      cacheEnabled: true,
      maxTokens: 4096,
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

      <Grid>
        {/* Server Settings */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper shadow="sm" p="md" withBorder>
            <Stack gap="md">
              <div>
                <Title order={3}>{t('config.serverSettings.title')}</Title>
                <Text size="sm" c="dimmed">
                  {t('config.serverSettings.subtitle')}
                </Text>
              </div>

              <NumberInput
                label={t('config.serverSettings.port')}
                description={t('config.serverSettings.portDescription')}
                value={config.port}
                onChange={value => handleChange('port', Number(value))}
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
                value={config.language}
                onChange={value => value && handleChange('language', value)}
                data={[
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
        </Grid.Col>

        {/* LLM Provider Settings */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper shadow="sm" p="md" withBorder>
            <Stack gap="md">
              <Text size="sm" c="dimmed">
                {t('config.llmProvider.subtitle')}
              </Text>

              <Select
                label={t('config.llmProvider.providerLabel')}
                description={t('config.llmProvider.providerDescription')}
                value={provider}
                onChange={handleProviderChange}
                data={[
                  { value: 'openai', label: t('config.llmProvider.providerOpenai') },
                  { value: 'anthropic', label: t('config.llmProvider.providerAnthropic') },
                  { value: 'ollama', label: t('config.llmProvider.providerOllama') },
                ]}
              />

              <TextInput
                label={t('config.llmProvider.modelLabel')}
                description={
                  provider === 'openai'
                    ? t('config.llmProvider.modelExampleOpenai')
                    : provider === 'anthropic'
                      ? t('config.llmProvider.modelExampleAnthropic')
                      : t('config.llmProvider.modelExampleOllama')
                }
                value={config.model}
                onChange={e => handleChange('model', e.target.value)}
                placeholder={PROVIDER_DEFAULTS[provider].model}
              />

              <TextInput
                label={t('config.llmProvider.urlLabel')}
                description={
                  provider === 'openai'
                    ? t('config.llmProvider.urlDescriptionOpenai')
                    : provider === 'anthropic'
                      ? t('config.llmProvider.urlDescriptionAnthropic')
                      : t('config.llmProvider.urlDescriptionOllama')
                }
                value={config.targetBaseUrl}
                onChange={e => handleChange('targetBaseUrl', e.target.value)}
                placeholder={PROVIDER_DEFAULTS[provider].url}
              />

              {provider !== 'ollama' && (
                <TextInput
                  label={t('config.llmProvider.apiKeyLabel')}
                  description={t('config.llmProvider.apiKeyDescription')}
                  type="password"
                  value={config.targetApiKey}
                  onChange={e => handleChange('targetApiKey', e.target.value)}
                  placeholder="sk-..."
                />
              )}
            </Stack>
          </Paper>
        </Grid.Col>

        {/* Performance Settings */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper shadow="sm" p="md" withBorder>
            <Stack gap="md">
              <div>
                <Title order={3}>{t('config.performance.title')}</Title>
                <Text size="sm" c="dimmed">
                  {t('config.performance.subtitle')}
                </Text>
              </div>

              <NumberInput
                label={t('config.performance.maxTokens')}
                description={t('config.performance.maxTokensDescription')}
                value={config.maxTokens}
                onChange={value => handleChange('maxTokens', Number(value))}
              />

              <Switch
                label={t('config.performance.caching')}
                description={t('config.performance.cachingDescription')}
                checked={config.cacheEnabled}
                onChange={e => handleChange('cacheEnabled', e.currentTarget.checked)}
              />
            </Stack>
          </Paper>
        </Grid.Col>

        {/* Danger Zone */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper
            shadow="sm"
            p="md"
            withBorder
            style={{ borderColor: 'var(--mantine-color-red-6)' }}
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
        </Grid.Col>
      </Grid>
    </Stack>
  )
}
