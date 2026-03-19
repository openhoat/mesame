export function WelcomeScreen() {
  return (
    <div
      id="welcome"
      className="flex flex-col items-center justify-center flex-1 text-center p-8 text-muted-foreground"
    >
      <img
        src="./assets/MeSame_icon.png"
        alt="MeSame"
        className="w-20 h-20 rounded-[20px] mb-6 opacity-80"
        onError={e => {
          e.currentTarget.style.display = 'none'
        }}
      />
      <h2 className="text-2xl text-slate-300 mb-2">MeSame Chat</h2>
      <p className="text-sm max-w-[400px] leading-relaxed">
        Start a conversation with your digital twin. Your writing style is automatically injected
        into every message.
      </p>
    </div>
  )
}
