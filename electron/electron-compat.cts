/**
 * Compatibility layer for importing Electron in ES modules.
 * Electron is a CommonJS module and doesn't support named exports in ES modules.
 */

import type { App, BrowserWindow as BrowserWindowClass, IpcMain, Screen, Shell } from 'electron'

// Use require to import Electron (CommonJS)
const electronModule = require('electron')

export const app: App = electronModule.app
export const BrowserWindow: typeof BrowserWindowClass = electronModule.BrowserWindow
export const ipcMain: IpcMain = electronModule.ipcMain
export const screen: Screen = electronModule.screen
export const shell: Shell = electronModule.shell

// Re-export the type with an alias to avoid conflicts
export type { BrowserWindowClass }
