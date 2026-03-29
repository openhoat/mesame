import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Set absolute path for DATABASE_URL before loading dotenv
// This ensures Prisma can find the database regardless of cwd
if (!process.env.DATABASE_URL) {
  const projectRoot = path.resolve(__dirname, '..')
  const dbPath = path.join(projectRoot, 'prisma', 'dev.db')
  process.env.DATABASE_URL = `file:${dbPath}`
  process.stderr.write(`[Electron Main] Setting DATABASE_URL to: ${process.env.DATABASE_URL}\n`)
  process.stderr.write(`[Electron Main] Project root: ${projectRoot}\n`)
  process.stderr.write(`[Electron Main] Current working directory: ${process.cwd()}\n`)
}

// Now load dotenv (which won't override DATABASE_URL if already set)
import 'dotenv/config'

import { buildApp } from '../src/app.js'
import { config } from '../src/config.js'
import {
  app,
  BrowserWindow,
  type BrowserWindowClass,
  ipcMain,
  screen,
  shell,
} from './electron-compat.cjs'

let mainWindow: BrowserWindowClass | null = null
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
  try {
    process.stderr.write('[Electron Main] Starting server...\n')
    process.stderr.write(`[Electron Main] Provider: ${config.provider}, Model: ${config.model}\n`)

    server = await buildApp()

    process.stderr.write('[Electron Main] App built successfully, starting to listen...\n')
    await server.listen({ port: config.port, host: config.host })

    server.log.info(`[Electron] Server started at http://localhost:${config.port}`)
    process.stderr.write(
      `[Electron Main] ✅ Server listening on http://${config.host}:${config.port}\n`
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : ''
    process.stderr.write(`[Electron Main] ❌ Failed to start server: ${errorMessage}\n`)
    if (errorStack) {
      process.stderr.write(`[Electron Main] Stack trace:\n${errorStack}\n`)
    }
    throw error
  }
}

function createWindow(): void {
  if (process.env.CI) {
    process.stderr.write('[Electron Main] Creating window...\n')
  }
  const windowWidth = 1200
  const windowHeight = 800

  // Get primary display dimensions
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize

  if (process.env.CI) {
    process.stderr.write(`[Electron Main] Primary display: ${screenWidth}x${screenHeight}\n`)
  }

  // Calculate centered position (add bounds offset for multi-screen support)
  const x = Math.round((screenWidth - windowWidth) / 2 + primaryDisplay.bounds.x)
  const y = Math.round((screenHeight - windowHeight) / 2 + primaryDisplay.bounds.y)

  if (process.env.CI) {
    process.stderr.write('[Electron Main] Creating BrowserWindow...\n')
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
    process.stderr.write(
      `[Electron Main] BrowserWindow created, loading URL: http://localhost:${config.port}\n`
    )
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
    process.stderr.write(`[Electron Main] ${msg}\n`)
    server?.log.error(msg)
  })

  mainWindow.webContents.on('did-finish-load', () => {
    const msg = 'Page loaded successfully'
    if (process.env.CI) {
      process.stderr.write(`[Electron Main] ${msg}\n`)
    }
    server?.log.info(msg)
  })

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    if (process.env.CI) {
      process.stderr.write('[Electron Main] Window ready-to-show event fired\n')
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
    if (process.env.CI) {
      process.stderr.write('[Electron Main] app.whenReady() called\n')
    }

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
    const errorStack = error instanceof Error ? error.stack : ''
    process.stderr.write(`[Electron] FATAL ERROR during startup: ${errorMessage}\n`)
    if (errorStack) {
      process.stderr.write(`[Electron] Stack trace: ${errorStack}\n`)
    }
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
