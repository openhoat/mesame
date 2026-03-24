import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config as dotenvConfig } from 'dotenv'
import { app, BrowserWindow, ipcMain, screen, shell } from 'electron'
import { buildApp } from '../src/app.js'
import { config } from '../src/config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env file from project root before anything else
const envPath = path.resolve(__dirname, '../../../.env')
dotenvConfig({ path: envPath, override: false })

let mainWindow: BrowserWindow | null = null
let server: Awaited<ReturnType<typeof buildApp>> | null = null
let isQuitting = false

// Suppress "worker is ending" errors from pino-pretty during shutdown
process.on('uncaughtException', (error: Error) => {
  if (error.message?.includes('worker') || error.message?.includes('ending')) {
    // Ignore worker thread errors during shutdown
    return
  }
  // Log other uncaught exceptions to stderr
  process.stderr.write(`[Electron] Uncaught exception: ${error.message}\n`)
})

const isDev = process.env.NODE_ENV === 'development' && !app.isPackaged

// Use smaller icon for development (X11 compatibility), larger for production builds
const iconName = isDev ? 'MeSame_icon_512.png' : 'MeSame_icon.png'

async function startServer(): Promise<void> {
  if (process.env.CI) {
    console.log('[Electron Main] Starting server...')
  }
  server = await buildApp()
  await server.listen({ port: config.port, host: config.host })
  server.log.info(`[Electron] Server started at http://localhost:${config.port}`)
  if (process.env.CI) {
    console.log(`[Electron Main] Server listening on port ${config.port}`)
  }
}

function createWindow(): void {
  if (process.env.CI) {
    console.log('[Electron Main] Creating window...')
  }
  const windowWidth = 1200
  const windowHeight = 800

  // Get primary display dimensions
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize

  if (process.env.CI) {
    console.log(`[Electron Main] Primary display: ${screenWidth}x${screenHeight}`)
  }

  // Calculate centered position (add bounds offset for multi-screen support)
  const x = Math.round((screenWidth - windowWidth) / 2 + primaryDisplay.bounds.x)
  const y = Math.round((screenHeight - windowHeight) / 2 + primaryDisplay.bounds.y)

  if (process.env.CI) {
    console.log('[Electron Main] Creating BrowserWindow...')
  }

  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x,
    y,
    minWidth: 800,
    minHeight: 600,
    title: 'MeSame',
    icon: path.join(__dirname, `../../assets/${iconName}`),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      devTools: isDev,
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
    backgroundColor: '#1a1a2e',
  })

  if (process.env.CI) {
    console.log(`[Electron Main] BrowserWindow created, loading URL: http://localhost:${config.port}`)
  }

  // Load the app from the local server
  mainWindow.loadURL(`http://localhost:${config.port}`)

  // Open DevTools only when explicitly requested via environment variable
  if (isDev && process.env.MESAME_DEVTOOLS === 'true') {
    mainWindow.webContents.openDevTools()
  }

  // Handle loading errors
  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    const msg = `Failed to load: ${errorCode} - ${errorDescription}`
    console.error(`[Electron Main] ${msg}`)
    server?.log.error(msg)
  })

  mainWindow.webContents.on('did-finish-load', () => {
    const msg = 'Page loaded successfully'
    if (process.env.CI) {
      console.log(`[Electron Main] ${msg}`)
    }
    server?.log.info(msg)
  })

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    if (process.env.CI) {
      console.log('[Electron Main] Window ready-to-show event fired')
    }
    mainWindow?.center()
    mainWindow?.show()
  })

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url)
    }
    return { action: 'deny' }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// IPC Handlers
function setupIpcHandlers(): void {
  // Get app version
  ipcMain.handle('get-app-version', () => {
    return app.getVersion()
  })

  // Get server status
  ipcMain.handle('get-server-status', () => {
    return server ? 'running' : 'stopped'
  })

  // Get configuration
  ipcMain.handle('get-config', () => {
    const configData = {
      port: config.port,
      host: config.host,
      provider: config.provider,
      targetBaseUrl: config.targetBaseUrl,
      model: config.model,
      logLevel: config.logLevel,
      language: config.language,
      // Don't expose API keys to renderer
      hasApiKey: !!config.targetApiKey,
    }

    return configData
  })
}

async function cleanup(): Promise<void> {
  if (isQuitting || !server) return
  isQuitting = true

  try {
    // Close all existing connections first
    await server.close()
    server.log.info('[Electron] Server stopped')
  } catch (error) {
    // Ignore "worker is ending" errors from pino-pretty during shutdown
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (!errorMessage.includes('worker')) {
      server?.log.error(`[Electron] Cleanup error: ${errorMessage}`)
    }
  }
}

// App lifecycle
app.whenReady().then(async () => {
  try {
    // Setup IPC handlers
    setupIpcHandlers()

    // Start the backend server
    await startServer()

    // Create the main window
    createWindow()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
      }
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    server?.log.error(`[Electron] Failed to start: ${errorMessage}`)
    app.quit()
  }
})

app.on('window-all-closed', async () => {
  // Gracefully close the server before quitting
  await cleanup()

  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Handle app quit (prevents uncaught exception from pino worker)
app.on('before-quit', async () => {
  await cleanup()
})
