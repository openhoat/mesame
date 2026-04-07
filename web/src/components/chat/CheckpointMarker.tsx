import { useTranslation } from 'react-i18next'

interface CheckpointMarkerProps {
  title: string
  onRestore: () => void
}

export const CheckpointMarker = ({ title, onRestore }: CheckpointMarkerProps) => {
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-2 py-1 px-2">
      <div className="flex-1 h-px bg-[hsl(var(--color-border))]" />
      <button
        type="button"
        onClick={onRestore}
        className="flex items-center gap-1.5 px-2 py-0.5 text-xs rounded-full
          bg-[hsl(var(--color-accent))]/10 border border-[hsl(var(--color-accent))]/30
          text-[hsl(var(--color-accent))] hover:bg-[hsl(var(--color-accent))]/20
          transition-colors cursor-pointer"
        title={t('chat.checkpoints.restoreTooltip')}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <title>{t('chat.checkpoints.restore')}</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {title}
      </button>
      <div className="flex-1 h-px bg-[hsl(var(--color-border))]" />
    </div>
  )
}
