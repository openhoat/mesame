import { MantineProvider } from '@mantine/core'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './i18n'
import '@mantine/core/styles.css'
import './index.css'

const root = document.getElementById('root')
if (root) {
  createRoot(root).render(
    <StrictMode>
      <MantineProvider defaultColorScheme="dark">
        <App />
      </MantineProvider>
    </StrictMode>
  )
}
