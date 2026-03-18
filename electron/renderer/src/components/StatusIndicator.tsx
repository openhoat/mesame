import { cn } from '@/lib/utils'

interface StatusIndicatorProps {
  isConnected: boolean
}

export function StatusIndicator({ isConnected }: StatusIndicatorProps) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-2.5 py-1 rounded-full bg-white/5">
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
        )}
      />
      <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
    </div>
  )
}
