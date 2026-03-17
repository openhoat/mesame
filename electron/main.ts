import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { app, BrowserWindow, shell } from 'electron'
import { buildApp } from '../src/app.js'
import { config } from '../src/config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

// Use smaller icon for development (X11 compatibility), larger for production builds
const iconName = isDev ? 'MeSame_icon_512.png' : 'MeSame_icon.png'

async function startServer(): Promise<void> {
  server = await buildApp()
  await server.listen({ port: config.port, host: config.host })
  server.log.info(`[Electron] Server started at http://localhost:${config.port}`)
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'MeSame',
    icon: path.join(__dirname, `../../assets/${iconName}`),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
    backgroundColor: '#1a1a2e',
  })

  // Load the app
  if (isDev) {
    // In development, load from the local server
    mainWindow.loadURL(`http://localhost:${config.port}`)
    // Open DevTools in development
    mainWindow.webContents.openDevTools()
  } else {
    // In production, load from the local server too
    mainWindow.loadURL(`http://localhost:${config.port}`)
  }

  // Handle loading errors
  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    server?.log.error(`Failed to load: ${errorCode} - ${errorDescription}`)
  })

  mainWindow.webContents.on('did-finish-load', () => {
    server?.log.info('Page loaded successfully')
  })

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
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
