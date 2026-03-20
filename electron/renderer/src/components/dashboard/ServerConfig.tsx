import { AlertCircle, RotateCcw, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

type LLMProvider = 'openai' | 'anthropic' | 'ollama'

interface ServerConfig {
  port: number
  model: string
  targetBaseUrl: string
  targetApiKey: string
  logLevel: string
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
    // Load current config
    // TODO: Implement config fetch endpoint
  }, [])

  const handleChange = (key: keyof ServerConfig, value: string | number | boolean) => {
    setConfig(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleProviderChange = (newProvider: LLMProvider) => {
    setProvider(newProvider)
    const defaults = PROVIDER_DEFAULTS[newProvider]
    setConfig(prev => ({
      ...prev,
      targetBaseUrl: defaults.url,
      model: defaults.model,
      // Clear API key when switching to Ollama (not required)
      targetApiKey: newProvider === 'ollama' ? '' : prev.targetApiKey,
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
      cacheEnabled: true,
      maxTokens: 4096,
    })
    setHasChanges(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Server Configuration</h1>
          <p className="text-muted-foreground">Manage proxy server settings</p>
        </div>
        {hasChanges && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <AlertCircle className="h-3 w-3" />
              Unsaved changes
            </Badge>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Server Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Server Settings</CardTitle>
            <CardDescription>Basic server configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="port" className="text-sm font-medium">
                Port
              </label>
              <Input
                id="port"
                type="number"
                value={config.port}
                onChange={e => handleChange('port', Number.parseInt(e.target.value, 10))}
                className="mt-1"
              />
              <p className="mt-1 text-xs text-muted-foreground">The port the server listens on</p>
            </div>

            <div>
              <label htmlFor="logLevel" className="text-sm font-medium">
                Log Level
              </label>
              <select
                id="logLevel"
                value={config.logLevel}
                onChange={e => handleChange('logLevel', e.target.value)}
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="error">Error</option>
                <option value="warn">Warning</option>
                <option value="info">Info</option>
                <option value="debug">Debug</option>
              </select>
              <p className="mt-1 text-xs text-muted-foreground">Verbosity of server logs</p>
            </div>
          </CardContent>
        </Card>

        {/* LLM Provider Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>LLM Provider</CardTitle>
                <CardDescription>Configure the upstream LLM service</CardDescription>
              </div>
              <Badge variant="secondary">{provider.toUpperCase()}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="provider" className="text-sm font-medium">
                Provider
              </label>
              <select
                id="provider"
                value={provider}
                onChange={e => handleProviderChange(e.target.value as LLMProvider)}
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="ollama">Ollama (Local)</option>
              </select>
              <p className="mt-1 text-xs text-muted-foreground">
                The LLM provider to use for chat completions
              </p>
            </div>

            <div>
              <label htmlFor="model" className="text-sm font-medium">
                Default Model
              </label>
              <Input
                id="model"
                value={config.model}
                onChange={e => handleChange('model', e.target.value)}
                placeholder={PROVIDER_DEFAULTS[provider].model}
                className="mt-1"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {provider === 'openai' && 'e.g., gpt-4o-mini, gpt-4o'}
                {provider === 'anthropic' &&
                  'e.g., claude-3-5-sonnet-20241022, claude-3-5-haiku-20241022'}
                {provider === 'ollama' && 'e.g., llama2, mistral, codellama'}
              </p>
            </div>

            <div>
              <label htmlFor="targetBaseUrl" className="text-sm font-medium">
                API Base URL
              </label>
              <Input
                id="targetBaseUrl"
                value={config.targetBaseUrl}
                onChange={e => handleChange('targetBaseUrl', e.target.value)}
                placeholder={PROVIDER_DEFAULTS[provider].url}
                className="mt-1"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                The base URL for the {provider} API
              </p>
            </div>

            {provider !== 'ollama' && (
              <div>
                <label htmlFor="targetApiKey" className="text-sm font-medium">
                  API Key
                </label>
                <Input
                  id="targetApiKey"
                  type="password"
                  value={config.targetApiKey}
                  onChange={e => handleChange('targetApiKey', e.target.value)}
                  placeholder="sk-..."
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Your API key is stored securely
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
            <CardDescription>Optimize server performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="maxTokens" className="text-sm font-medium">
                Max Tokens
              </label>
              <Input
                id="maxTokens"
                type="number"
                value={config.maxTokens}
                onChange={e => handleChange('maxTokens', Number.parseInt(e.target.value, 10))}
                className="mt-1"
              />
              <p className="mt-1 text-xs text-muted-foreground">Maximum tokens per request</p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="cacheEnabled" className="text-sm font-medium">
                  Enable Caching
                </label>
                <p className="text-xs text-muted-foreground">
                  Cache responses for better performance
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleChange('cacheEnabled', !config.cacheEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.cacheEnabled ? 'bg-primary' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.cacheEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset to Defaults
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
