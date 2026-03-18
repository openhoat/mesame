import { type KeyboardEvent, useRef, useState } from 'react'
import { useAutoResize } from '@/hooks/use-auto-resize'

interface ChatInputProps {
  onSend: (text: string) => void
  disabled: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { resize } = useAutoResize(textareaRef)

  const canSend = value.trim().length > 0 && !disabled

  function handleSend() {
    if (!canSend) return
    onSend(value.trim())
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="px-5 py-4 bg-black/20 border-t border-white/[0.08] shrink-0">
      <div className="flex gap-3 items-end max-w-[900px] mx-auto">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => {
            setValue(e.target.value)
            resize()
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 bg-white/[0.06] border border-white/[0.12] rounded-xl px-4 py-3 text-slate-200 text-sm resize-none outline-none leading-relaxed max-h-[200px] min-h-[44px] transition-colors focus:border-accent/50 placeholder:text-slate-600 font-[inherit]"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className="w-11 h-11 rounded-xl border-none bg-gradient-to-br from-accent to-accent-secondary text-white cursor-pointer flex items-center justify-center shrink-0 transition-all hover:enabled:opacity-90 active:enabled:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
            role="img"
            aria-label="Send message"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
      <p className="text-center text-[0.7rem] text-slate-600 mt-1.5">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  )
}
