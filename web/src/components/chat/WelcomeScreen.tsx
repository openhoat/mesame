import { useTranslation } from 'react-i18next'

export function WelcomeScreen() {
  const { t } = useTranslation()

  return (
    <div
      id="welcome"
      className="flex flex-col items-center justify-center flex-1 text-center p-8 text-muted-foreground"
    >
      <img
        src="./assets/MeSame_icon.png"
        alt={t('chat.welcome.pageTitle')}
        className="w-20 h-20 rounded-[20px] mb-6 opacity-80"
        onError={e => {
          e.currentTarget.style.display = 'none'
        }}
      />
      <h2 className="text-2xl text-slate-300 mb-2">{t('chat.welcome.pageTitle')}</h2>
      <p className="text-sm max-w-[400px] leading-relaxed">{t('chat.welcome.longDescription')}</p>
    </div>
  )
}
