import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { app, BrowserWindow, shell } from 'electron'
import { buildApp } from '../src/app.js'
import { config } from '../src/config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mainWindow: BrowserWindow | null = null
let server: Awaited<ReturnType<typeof buildApp>> | null = null

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

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
    icon: path.join(__dirname, '../assets/MeSame_icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
  })

  // Load the app
  if (isDev) {
    // In development, load from the local server
    mainWindow.loadURL(`http://localhost:${config.port}`)
    mainWindow.webContents.openDevTools()
  } else {
    // In production, load the static HTML
    mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'))
  }

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
  if (server) {
    await server.close()
    server.log.info('[Electron] Server stopped')
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
  } catch {
    app.quit()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', async () => {
  await cleanup()
})
