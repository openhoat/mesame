import { type RefObject, useCallback } from 'react'

const MAX_HEIGHT = 200

export function useAutoResize(ref: RefObject<HTMLTextAreaElement | null>) {
  const resize = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`
  }, [ref])

  return { resize }
}
