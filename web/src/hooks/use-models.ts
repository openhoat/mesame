import { useCallback, useEffect, useState } from 'react'

export interface Model {
  id: string
  name: string
  provider: string
  owned_by: string
}

export interface ModelsState {
  models: Model[]
  loading: boolean
  error: string | null
}

/**
 * Hook to fetch and manage available models from all providers
 */
export function useModels() {
  const [state, setState] = useState<ModelsState>({
    models: [],
    loading: true,
    error: null,
  })

  const fetchModels = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      const response = await fetch('/v1/models')
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`)
      }
      const data = await response.json()
      const models: Model[] = (data.data || []).map((model: { id: string; owned_by: string }) => {
        const [provider, ...nameParts] = model.id.split('/')
        return {
          id: model.id,
          name: nameParts.join('/') || model.id,
          provider: provider || 'unknown',
          owned_by: model.owned_by,
        }
      })
      setState({ models, loading: false, error: null })
    } catch (error) {
      setState({
        models: [],
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch models',
      })
    }
  }, [])

  useEffect(() => {
    fetchModels()
  }, [fetchModels])

  return {
    ...state,
    refetch: fetchModels,
  }
}

/**
 * Get the default model from localStorage or first available model
 */
export function getDefaultModel(models: Model[]): string | null {
  const stored = localStorage.getItem('selectedModel')
  if (stored && models.some(m => m.id === stored)) {
    return stored
  }
  return models[0]?.id ?? null
}

/**
 * Store the selected model in localStorage
 */
export function setSelectedModel(modelId: string): void {
  localStorage.setItem('selectedModel', modelId)
}
