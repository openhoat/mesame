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
          <Title order={1}>Server Configuration</Title>
          <Text c="dimmed">Manage proxy server settings</Text>
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
              <Text size="sm">Unsaved changes</Text>
            </Group>
            <Button onClick={handleSave} loading={isSaving} leftSection={<Save size={16} />}>
              Save Changes
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
                <Title order={3}>Server Settings</Title>
                <Text size="sm" c="dimmed">
                  Basic server configuration
                </Text>
              </div>

              <NumberInput
                label="Port"
                description="The port the server listens on"
                value={config.port}
                onChange={value => handleChange('port', Number(value))}
              />

              <Select
                label="Log Level"
                description="Verbosity of server logs"
                value={config.logLevel}
                onChange={value => value && handleChange('logLevel', value)}
                data={[
                  { value: 'error', label: 'Error' },
                  { value: 'warn', label: 'Warning' },
                  { value: 'info', label: 'Info' },
                  { value: 'debug', label: 'Debug' },
                ]}
              />

              <Select
                label="Response Language"
                description="Language for assistant responses"
                value={config.language}
                onChange={value => value && handleChange('language', value)}
                data={[
                  { value: 'en', label: 'English' },
                  { value: 'fr', label: 'Français (French)' },
                  { value: 'es', label: 'Español (Spanish)' },
                  { value: 'de', label: 'Deutsch (German)' },
                  { value: 'it', label: 'Italiano (Italian)' },
                  { value: 'pt', label: 'Português (Portuguese)' },
                  { value: 'ru', label: 'Русский (Russian)' },
                  { value: 'ja', label: '日本語 (Japanese)' },
                  { value: 'zh', label: '中文 (Chinese)' },
                  { value: 'ko', label: '한국어 (Korean)' },
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
                Configure the upstream LLM service
              </Text>

              <Select
                label="Provider"
                description="The LLM provider to use for chat completions"
                value={provider}
                onChange={handleProviderChange}
                data={[
                  { value: 'openai', label: 'OpenAI' },
                  { value: 'anthropic', label: 'Anthropic' },
                  { value: 'ollama', label: 'Ollama' },
                ]}
              />

              <TextInput
                label="Default Model"
                description={
                  provider === 'openai'
                    ? 'e.g., gpt-4o-mini, gpt-4o'
                    : provider === 'anthropic'
                      ? 'e.g., claude-3-5-sonnet-20241022, claude-3-5-haiku-20241022'
                      : 'e.g., llama2, mistral, codellama'
                }
                value={config.model}
                onChange={e => handleChange('model', e.target.value)}
                placeholder={PROVIDER_DEFAULTS[provider].model}
              />

              <TextInput
                label="API Base URL"
                description={`The base URL for the ${provider} API`}
                value={config.targetBaseUrl}
                onChange={e => handleChange('targetBaseUrl', e.target.value)}
                placeholder={PROVIDER_DEFAULTS[provider].url}
              />

              {provider !== 'ollama' && (
                <TextInput
                  label="API Key"
                  description="Your API key is stored securely"
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
                <Title order={3}>Performance</Title>
                <Text size="sm" c="dimmed">
                  Optimize server performance
                </Text>
              </div>

              <NumberInput
                label="Max Tokens"
                description="Maximum tokens per request"
                value={config.maxTokens}
                onChange={value => handleChange('maxTokens', Number(value))}
              />

              <Switch
                label="Enable Caching"
                description="Cache responses for better performance"
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
                  Danger Zone
                </Title>
                <Text size="sm" c="dimmed">
                  Irreversible actions
                </Text>
              </div>

              <Button color="red" leftSection={<RotateCcw size={16} />} onClick={handleReset}>
                Reset to Defaults
              </Button>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  )
}
