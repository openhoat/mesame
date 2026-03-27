import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface StatusIndicatorProps {
  isConnected: boolean
}

export function StatusIndicator({ isConnected }: StatusIndicatorProps) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-2.5 py-1 rounded-full bg-white/5">
      <span
        id="status-dot"
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          isConnected ? 'bg-green-500 animate-pulse connected' : 'bg-red-500 disconnected'
        )}
      />
      <span id="status-label">
        {isConnected ? t('status.connected') : t('status.disconnected')}
      </span>
    </div>
  )
}
