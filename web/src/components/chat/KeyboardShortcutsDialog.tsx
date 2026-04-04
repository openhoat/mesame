import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { formatShortcut, type KeyboardShortcut } from '@/hooks/use-keyboard-shortcuts'

interface KeyboardShortcutsDialogProps {
  shortcuts: KeyboardShortcut[]
  onClose: () => void
}

export const KeyboardShortcutsDialog = ({ shortcuts, onClose }: KeyboardShortcutsDialogProps) => {
  const { t } = useTranslation()

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">{t('chat.shortcuts.title')}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            aria-label={t('common.close')}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              role="img"
              aria-label="Close icon"
            >
              <title>{t('common.close')}</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="px-6 py-4 space-y-2 max-h-[60vh] overflow-y-auto">
          {shortcuts.map(shortcut => (
            <div
              key={`${shortcut.key}-${shortcut.ctrl ? 'ctrl' : ''}-${shortcut.shift ? 'shift' : ''}`}
              className="flex items-center justify-between py-2"
            >
              <span className="text-sm text-gray-300">{shortcut.description}</span>
              <kbd className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-medium text-gray-300 bg-white/[0.06] border border-white/10 rounded-lg min-w-[3rem] justify-center">
                {formatShortcut(shortcut)}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-white/[0.02]">
          <p className="text-xs text-gray-500 text-center">{t('chat.shortcuts.footer')}</p>
        </div>
      </div>

      {/* Backdrop click to close */}
      <button
        type="button"
        className="absolute inset-0 -z-10"
        onClick={onClose}
        aria-label={t('common.close')}
      />
    </div>
  )
}
