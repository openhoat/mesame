// Electron API type definitions for the renderer process

export interface ElectronAPI {
  platform: NodeJS.Platform
  getAppVersion: () => Promise<string>
  getServerStatus: () => Promise<string>
  getConfig: () => Promise<{
    port: number
    host: string
    provider: string
    targetBaseUrl: string
    model: string
    logLevel: string
    hasApiKey: boolean
  }>
  onServerStatusChange: (callback: (status: string) => void) => void
  removeServerStatusListener: () => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
