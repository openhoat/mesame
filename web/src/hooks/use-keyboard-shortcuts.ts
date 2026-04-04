import { useCallback, useEffect } from 'react'

export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
  alt?: boolean
  description: string
  action: () => void
}

/**
 * Checks whether the platform is macOS.
 */
const isMac = (): boolean => navigator.platform.toUpperCase().includes('MAC')

/**
 * Checks whether the modifier key matches the shortcut definition.
 * On macOS, `ctrl` shortcuts are mapped to `meta` (Cmd) automatically.
 */
const matchesModifier = (e: KeyboardEvent, shortcut: KeyboardShortcut): boolean => {
  const useMeta = isMac()
  const wantsMod = shortcut.ctrl ?? shortcut.meta ?? false

  if (wantsMod) {
    // On macOS use Cmd, on other platforms use Ctrl
    const modPressed = useMeta ? e.metaKey : e.ctrlKey
    if (!modPressed) return false
  } else {
    // If no modifier is wanted, neither should be pressed
    if (e.ctrlKey || e.metaKey) return false
  }

  if ((shortcut.shift ?? false) !== e.shiftKey) return false
  if ((shortcut.alt ?? false) !== e.altKey) return false

  return true
}

/**
 * Returns a human-readable label for a shortcut's modifier+key combination.
 */
export const formatShortcut = (
  shortcut: Pick<KeyboardShortcut, 'key' | 'ctrl' | 'meta' | 'shift' | 'alt'>
): string => {
  const parts: string[] = []
  const useMac = isMac()

  if (shortcut.ctrl || shortcut.meta) {
    parts.push(useMac ? '\u2318' : 'Ctrl')
  }
  if (shortcut.shift) {
    parts.push(useMac ? '\u21E7' : 'Shift')
  }
  if (shortcut.alt) {
    parts.push(useMac ? '\u2325' : 'Alt')
  }

  // Map special key names to readable labels
  const keyLabels: Record<string, string> = {
    '/': '/',
    Escape: 'Esc',
    ArrowUp: '\u2191',
    ArrowDown: '\u2193',
    Enter: '\u21B5',
  }

  parts.push(keyLabels[shortcut.key] ?? shortcut.key.toUpperCase())

  return parts.join(useMac ? '' : '+')
}

/**
 * Hook to register global keyboard shortcuts.
 * Shortcuts are active when the component is mounted and cleaned up on unmount.
 */
export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[], enabled = true): void => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return

      // Skip shortcuts when typing in input/textarea elements,
      // unless the shortcut explicitly requires a modifier key
      const target = e.target
      const isEditable =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable)

      for (const shortcut of shortcuts) {
        if (e.key !== shortcut.key) continue
        if (!matchesModifier(e, shortcut)) continue

        // For plain key shortcuts (no modifier), skip when in editable elements
        const hasModifier = shortcut.ctrl || shortcut.meta || shortcut.shift || shortcut.alt
        if (!hasModifier && isEditable) continue

        e.preventDefault()
        shortcut.action()
        return
      }
    },
    [shortcuts, enabled]
  )

  useEffect(() => {
    if (!enabled) return

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, enabled])
}
