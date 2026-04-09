import { useTranslation } from 'react-i18next'

interface CheckpointMarkerProps {
  title: string
  onRestore: () => void
}

export const CheckpointMarker = ({ title, onRestore }: CheckpointMarkerProps) => {
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-2 py-1">
      <div className="flex-1 h-px bg-[hsl(var(--color-border))]" />
      <button
        type="button"
        onClick={onRestore}
        className="flex items-center gap-1.5 px-2 py-0.5 text-xs rounded-sm
          text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-accent))]
          hover:bg-[hsl(var(--color-accent))]/5
          transition-colors cursor-pointer"
        title={t('chat.checkpoints.restoreTooltip')}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <title>{t('chat.checkpoints.restore')}</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
          />
        </svg>
        <span className="max-w-[150px] truncate opacity-70">{title}</span>
      </button>
      <div className="flex-1 h-px bg-[hsl(var(--color-border))]" />
    </div>
  )
}
