import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Modal,
  NumberInput,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { Check, Key, Play, Plus, RefreshCw, Settings, Trash, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

type ProviderType = 'openai' | 'anthropic' | 'google' | 'ollama'

interface ProviderTypeInfo {
  type: ProviderType
  displayName: string
  defaultBaseUrl: string
  requiresApiKey: boolean
}

const PROVIDER_TYPES: Record<ProviderType, ProviderTypeInfo> = {
  openai: {
    type: 'openai',
    displayName: 'OpenAI',
    defaultBaseUrl: 'https://api.openai.com',
    requiresApiKey: true,
  },
  anthropic: {
    type: 'anthropic',
    displayName: 'Anthropic',
    defaultBaseUrl: 'https://api.anthropic.com',
    requiresApiKey: true,
  },
  google: {
    type: 'google',
    displayName: 'Google',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com',
    requiresApiKey: true,
  },
  ollama: {
    type: 'ollama',
    displayName: 'Ollama',
    defaultBaseUrl: 'http://localhost:11434',
    requiresApiKey: false,
  },
}

interface Provider {
  id: number
  type: ProviderType
  name: string
  displayName: string
  baseUrl: string
  hasApiKey?: boolean
  enabled: boolean
  priority: number
  modelsCount: number
}

interface ProviderFormData {
  type: ProviderType
  name: string
  displayName: string
  baseUrl: string
  apiKey: string
  enabled: boolean
  priority: number
}

export function Providers() {
  const { t } = useTranslation()
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null)
  const [saving, setSaving] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [testingProvider, setTestingProvider] = useState<string | null>(null)
  const [_testResult, setTestResult] = useState<{
    name: string
    success: boolean
    error?: string
  } | null>(null)

  const [formData, setFormData] = useState<ProviderFormData>({
    type: 'openai',
    name: '',
    displayName: '',
    baseUrl: '',
    apiKey: '',
    enabled: true,
    priority: 0,
  })

  const generateDefaultName = (type: ProviderType, existingProviders: Provider[]): string => {
    const displayName = PROVIDER_TYPES[type].displayName

    // Check if the base name (without index) is available
    const baseNameExists = existingProviders.some(p => p.name === displayName)
    if (!baseNameExists) {
      return displayName
    }

    // Find next available index
    const existingNames = existingProviders
      .filter(p => p.type === type)
      .map(p => p.name)
      .filter(name => new RegExp(`^${displayName}\\d+$`).test(name))
      .map(name => Number.parseInt(name.replace(displayName, ''), 10))
      .filter(num => !Number.isNaN(num))

    let index = 1
    while (existingNames.includes(index)) {
      index++
    }

    return `${displayName}${index}`
  }

  const fetchProviders = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/providers')
      if (response.ok) {
        const data = await response.json()
        setProviders(data.providers)
      }
    } catch (_error) {
      // Failed to fetch providers
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProviders()
  }, [fetchProviders])

  const handleRefreshModels = async () => {
    setRefreshing(true)
    try {
      await fetchProviders()
    } finally {
      setRefreshing(false)
    }
  }

  const handleTestProvider = async (provider: Provider) => {
    setTestingProvider(provider.name)
    try {
      const response = await fetch(`/api/providers/${provider.name}/models`)
      if (response.ok) {
        setTestResult({ name: provider.name, success: true })
      } else {
        const error = await response.json()
        setTestResult({ name: provider.name, success: false, error: error.error })
      }
    } catch (_error) {
      setTestResult({ name: provider.name, success: false, error: 'Connection failed' })
    } finally {
      setTestingProvider(null)
    }
  }

  const handleOpenModal = (provider?: Provider) => {
    if (provider) {
      setEditingProvider(provider)
      setFormData({
        type: provider.type,
        name: provider.name,
        displayName: provider.displayName,
        baseUrl: provider.baseUrl,
        apiKey: '', // Don't show existing API key
        enabled: provider.enabled,
        priority: provider.priority,
      })
    } else {
      setEditingProvider(null)
      const defaultType = 'openai'
      setFormData({
        type: defaultType,
        name: generateDefaultName(defaultType, providers),
        displayName: '',
        baseUrl: PROVIDER_TYPES.openai.defaultBaseUrl,
        apiKey: '',
        enabled: true,
        priority: 0,
      })
    }
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingProvider(null)
    setFormData({
      type: 'openai',
      name: '',
      displayName: '',
      baseUrl: PROVIDER_TYPES.openai.defaultBaseUrl,
      apiKey: '',
      enabled: true,
      priority: 0,
    })
  }

  const handleTypeChange = (value: string | null) => {
    if (!value) return
    const providerType = value as ProviderType
    const typeInfo = PROVIDER_TYPES[providerType]
    setFormData(prev => ({
      ...prev,
      type: providerType,
      name: editingProvider ? prev.name : generateDefaultName(providerType, providers),
      displayName: typeInfo.displayName,
      baseUrl: typeInfo.defaultBaseUrl,
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/providers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: formData.type,
          name: formData.name,
          displayName: formData.displayName,
          baseUrl: formData.baseUrl,
          apiKey: formData.apiKey || null,
          enabled: formData.enabled,
          priority: formData.priority,
        }),
      })

      if (response.ok) {
        await fetchProviders()
        handleCloseModal()
      }
    } finally {
      setSaving(false)
    }
  }

  const handleToggleEnabled = async (provider: Provider) => {
    try {
      const response = await fetch('/api/providers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: provider.type,
          name: provider.name,
          displayName: provider.displayName,
          baseUrl: provider.baseUrl,
          enabled: !provider.enabled,
          priority: provider.priority,
        }),
      })

      if (response.ok) {
        await fetchProviders()
      }
    } catch (_error) {
      // Failed to toggle provider
    }
  }

  const handleDelete = async (provider: Provider) => {
    if (!window.confirm(t('providers.confirmDelete', { name: provider.displayName }))) {
      return
    }

    try {
      const response = await fetch(`/api/providers/${provider.name}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchProviders()
      }
    } catch (_error) {
      // Failed to delete provider
    }
  }

  const providerTypeOptions = Object.entries(PROVIDER_TYPES).map(([key, value]) => ({
    value: key,
    label: value.displayName,
  }))

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={1}>{t('providers.title')}</Title>
          <Text c="dimmed">{t('providers.subtitle')}</Text>
        </div>
        <Group gap="xs">
          <ActionIcon variant="subtle" onClick={handleRefreshModels} loading={refreshing}>
            <RefreshCw size={16} />
          </ActionIcon>
          <Button leftSection={<Plus size={16} />} onClick={() => handleOpenModal()}>
            {t('providers.addProvider')}
          </Button>
        </Group>
      </Group>

      <Paper shadow="sm" p="md" withBorder>
        {loading ? (
          <Text c="dimmed">{t('common.loading')}</Text>
        ) : providers.length === 0 ? (
          <Text c="dimmed">{t('providers.emptyState')}</Text>
        ) : (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('providers.table.name')}</Table.Th>
                <Table.Th>{t('providers.table.type')}</Table.Th>
                <Table.Th>{t('providers.table.baseUrl')}</Table.Th>
                <Table.Th>{t('providers.table.models')}</Table.Th>
                <Table.Th>{t('providers.table.apiKey')}</Table.Th>
                <Table.Th>{t('providers.table.status')}</Table.Th>
                <Table.Th>{t('providers.table.actions')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {providers.map(provider => (
                <Table.Tr key={provider.name}>
                  <Table.Td>
                    <Text fw={500}>{provider.displayName}</Text>
                    <Text size="xs" c="dimmed">
                      {provider.name}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light">
                      {PROVIDER_TYPES[provider.type]?.displayName || provider.type}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{provider.baseUrl}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light">{provider.modelsCount} models</Badge>
                  </Table.Td>
                  <Table.Td>
                    {provider.hasApiKey ? (
                      <Group gap="xs">
                        <Key size={14} />
                        <Text size="sm" c="green">
                          {t('providers.apiKeyConfigured')}
                        </Text>
                      </Group>
                    ) : PROVIDER_TYPES[provider.type]?.requiresApiKey ? (
                      <Text size="sm" c="orange">
                        {t('providers.apiKeyMissing')}
                      </Text>
                    ) : (
                      <Text size="sm" c="dimmed">
                        {t('providers.apiKeyNotRequired')}
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Switch
                      checked={provider.enabled}
                      onChange={() => handleToggleEnabled(provider)}
                      label={provider.enabled ? t('providers.enabled') : t('providers.disabled')}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Stack gap="xs">
                      <Group gap="xs">
                        <ActionIcon
                          variant="subtle"
                          onClick={() => handleTestProvider(provider)}
                          loading={testingProvider === provider.name}
                          title={t('providers.testConnection')}
                        >
                          <Play size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" onClick={() => handleOpenModal(provider)}>
                          <Settings size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => handleDelete(provider)}
                        >
                          <Trash size={16} />
                        </ActionIcon>
                      </Group>
                      {_testResult?.name === provider.name && (
                        <Group gap="xs">
                          {_testResult.success ? (
                            <Text size="xs" c="green">
                              <Check size={12} style={{ display: 'inline' }} />{' '}
                              {t('providers.testSuccess')}
                            </Text>
                          ) : (
                            <Text size="xs" c="red">
                              <X size={12} style={{ display: 'inline' }} />{' '}
                              {_testResult.error || t('providers.testFailed')}
                            </Text>
                          )}
                        </Group>
                      )}
                    </Stack>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>

      <Modal
        opened={modalOpen}
        onClose={handleCloseModal}
        title={editingProvider ? t('providers.editProvider') : t('providers.addProvider')}
      >
        <Stack gap="md">
          {editingProvider ? (
            <>
              <TextInput
                label={t('providers.form.type')}
                value={PROVIDER_TYPES[formData.type]?.displayName || formData.type}
                disabled
                description={t('providers.form.typeDescription')}
              />

              <TextInput
                label={t('providers.form.name')}
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                description={t('providers.form.nameDescription')}
              />

              <TextInput
                label={t('providers.form.displayName')}
                value={formData.displayName}
                onChange={e => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder={t('providers.form.displayNamePlaceholder')}
              />
            </>
          ) : (
            <>
              <Select
                label={t('providers.form.type')}
                value={formData.type}
                onChange={handleTypeChange}
                data={providerTypeOptions}
                description={t('providers.form.typeDescription')}
              />

              <TextInput
                label={t('providers.form.name')}
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t('providers.form.namePlaceholder')}
                description={t('providers.form.nameDescription')}
              />
            </>
          )}

          <TextInput
            label={t('providers.form.baseUrl')}
            value={formData.baseUrl}
            onChange={e => setFormData(prev => ({ ...prev, baseUrl: e.target.value }))}
            placeholder="https://api.example.com"
          />

          {(editingProvider
            ? PROVIDER_TYPES[formData.type]?.requiresApiKey
            : formData.type !== 'ollama') && (
            <Stack gap="xs">
              <TextInput
                label={t('providers.form.apiKey')}
                type="password"
                value={formData.apiKey}
                onChange={e => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder={editingProvider ? t('providers.form.apiKeyPlaceholderEdit') : 'sk-...'}
              />
              {editingProvider && (
                <Text size="xs" c="dimmed">
                  {t('providers.form.apiKeyHint')}
                </Text>
              )}
            </Stack>
          )}

          <NumberInput
            label={t('providers.form.priority')}
            value={formData.priority}
            onChange={value => setFormData(prev => ({ ...prev, priority: Number(value) || 0 }))}
            description={t('providers.form.priorityDescription')}
          />

          <Switch
            label={t('providers.form.enabled')}
            checked={formData.enabled}
            onChange={e => setFormData(prev => ({ ...prev, enabled: e.currentTarget.checked }))}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={handleCloseModal}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSave} loading={saving} disabled={!formData.name}>
              {t('common.save')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
}
