import { MantineProvider } from '@mantine/core'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'
import './i18n'
import '@mantine/core/styles.css'
import './index.css'

const root = document.getElementById('root')
if (root) {
  createRoot(root).render(
    <StrictMode>
      <BrowserRouter>
        <MantineProvider defaultColorScheme="auto">
          <App />
        </MantineProvider>
      </BrowserRouter>
    </StrictMode>
  )
}
