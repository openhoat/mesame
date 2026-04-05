import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default defineConfig(
  withMermaid({
    title: 'MeSame',
    description: 'Your Personal Style Proxy — Transform any LLM into your digital twin',
    base: '/mesame/',
    head: [['link', { rel: 'icon', type: 'image/png', href: '/mesame/logo.png' }]],
    themeConfig: {
      logo: '/logo.png',
      nav: [
        { text: 'Guide', link: '/guide/getting-started' },
        { text: 'Configuration', link: '/guide/configuration' },
        {
          text: 'v0.1.0',
          link: 'https://github.com/openhoat/mesame/releases/tag/v0.1.0',
        },
      ],
      sidebar: [
        {
          text: 'Introduction',
          items: [
            { text: 'What is MeSame?', link: '/' },
            { text: 'Getting Started', link: '/guide/getting-started' },
          ],
        },
        {
          text: 'User Guide',
          items: [
            { text: 'Usage', link: '/guide/usage' },
            { text: 'Configuration', link: '/guide/configuration' },
            { text: 'Backup & Restore', link: '/guide/backup-restore' },
            { text: 'Build Executables', link: '/guide/build' },
          ],
        },
        {
          text: 'Reference',
          items: [
            { text: 'Architecture', link: '/guide/architecture' },
            { text: 'Keyboard Navigation', link: '/guide/keyboard-navigation' },
          ],
        },
        {
          text: 'Help',
          items: [
            { text: 'Troubleshooting', link: '/guide/troubleshooting' },
            { text: 'Contributing', link: '/guide/contributing' },
            {
              text: 'Changelog',
              link: 'https://github.com/openhoat/mesame/blob/main/CHANGELOG.md',
            },
          ],
        },
      ],
      socialLinks: [{ icon: 'github', link: 'https://github.com/openhoat/mesame' }],
      footer: {
        message: 'Released under the MIT License.',
        copyright: 'Copyright © 2026 Olivier Penhoat',
      },
      editLink: {
        pattern: 'https://github.com/openhoat/mesame/edit/main/docs/:path',
        text: 'Edit this page on GitHub',
      },
    },
    mermaid: {
      // Mermaid configuration options
    },
  })
)