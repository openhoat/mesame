import { StatusIndicator } from '@/components/StatusIndicator'

interface ChatHeaderProps {
  isConnected: boolean
}

export function ChatHeader({ isConnected }: ChatHeaderProps) {
  return (
    <header className="flex items-center gap-3 px-5 py-3 bg-black/30 border-b border-white/[0.08] shrink-0">
      <img
        src="./assets/MeSame_icon.png"
        alt="MeSame"
        className="w-8 h-8 rounded-lg"
        onError={e => {
          e.currentTarget.style.display = 'none'
        }}
      />
      <span className="text-lg font-semibold text-white">MeSame</span>
      <span className="text-xs text-muted-foreground ml-2">Your personal style proxy</span>
      <div className="flex-1" />
      <StatusIndicator isConnected={isConnected} />
    </header>
  )
}
