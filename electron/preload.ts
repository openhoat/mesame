import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Platform information
  platform: process.platform,

  // App information
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  // Server status
  getServerStatus: () => ipcRenderer.invoke('get-server-status'),

  // Configuration
  getConfig: () => ipcRenderer.invoke('get-config'),

  // Events
  onServerStatusChange: (callback: (status: string) => void) => {
    ipcRenderer.on('server-status-change', (_event, status) => callback(status))
  },
  removeServerStatusListener: () => {
    ipcRenderer.removeAllListeners('server-status-change')
  },
})

// Type definitions for the exposed API
export interface ElectronAPI {
  platform: NodeJS.Platform
  getAppVersion: () => Promise<string>
  getServerStatus: () => Promise<string>
  getConfig: () => Promise<Record<string, unknown>>
  onServerStatusChange: (callback: (status: string) => void) => void
  removeServerStatusListener: () => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
