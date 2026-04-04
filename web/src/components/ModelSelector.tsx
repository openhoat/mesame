import { Select } from '@mantine/core'
import { Bot } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useModels } from '@/hooks/use-models'

interface ModelSelectorProps {
  value: string | null
  onChange: (modelId: string) => void
  label?: string
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
}

export function ModelSelector({
  value,
  onChange,
  label,
  placeholder = 'Select a model',
  size = 'sm',
}: ModelSelectorProps) {
  const { models, loading, error, refetch } = useModels()
  const [selectedModel, setSelectedModel] = useState<string | null>(value)

  useEffect(() => {
    if (!selectedModel && models.length > 0 && !loading) {
      const stored = localStorage.getItem('selectedModel')
      const defaultModel = stored && models.some(m => m.id === stored) ? stored : models[0]?.id
      if (defaultModel) {
        setSelectedModel(defaultModel)
        onChange(defaultModel)
      }
    }
  }, [models, loading, selectedModel, onChange])

  const handleChange = (modelId: string | null) => {
    if (modelId) {
      setSelectedModel(modelId)
      localStorage.setItem('selectedModel', modelId)
      onChange(modelId)
    }
  }

  // Group models by provider
  const groupedData = models.reduce<Record<string, { value: string; label: string }[]>>(
    (acc, model) => {
      const provider = model.provider
      if (!acc[provider]) {
        acc[provider] = []
      }
      acc[provider].push({
        value: model.id,
        label: model.name,
      })
      return acc
    },
    {}
  )

  // Format for Mantine Select with groups
  const selectData = Object.entries(groupedData).map(([provider, modelList]) => ({
    group: provider.charAt(0).toUpperCase() + provider.slice(1),
    items: modelList,
  }))

  if (error) {
    return (
      <Group gap="xs">
        <Bot size={16} />
        <Text size={size} c="red">
          Error loading models
        </Text>
      </Group>
    )
  }

  return (
    <Select
      label={label}
      placeholder={placeholder}
      value={selectedModel}
      onChange={handleChange}
      data={selectData}
      size={size}
      loading={loading}
      clearable={false}
      searchable
      leftSection={<Bot size={16} />}
      aria-label={placeholder}
      styles={{
        input: {
          minWidth: '200px',
        },
      }}
      onDropdownOpen={() => {
        // Refetch models when opening dropdown
        refetch()
      }}
    />
  )
}
