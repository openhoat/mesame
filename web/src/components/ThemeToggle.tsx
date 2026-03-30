import { ActionIcon, Group, Menu, Text } from '@mantine/core'
import { Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/hooks/use-theme'

interface ThemeToggleProps {
  /** Toggle variant: simple icon or dropdown menu */
  variant?: 'icon' | 'menu'
}

/**
 * Theme toggle component with system preference support
 */
export function ThemeToggle({ variant = 'icon' }: ThemeToggleProps) {
  const { t } = useTranslation()
  const { colorScheme, toggleColorScheme } = useTheme()

  const icon = colorScheme === 'dark' ? <Moon size={18} /> : <Sun size={18} />

  if (variant === 'icon') {
    return (
      <ActionIcon onClick={toggleColorScheme} variant="subtle" title={t('theme.toggle')} size="lg">
        {icon}
      </ActionIcon>
    )
  }

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <ActionIcon variant="subtle" title={t('theme.selectTheme')} size="lg">
          {icon}
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>{t('theme.selectTheme')}</Menu.Label>
        <Menu.Item
          leftSection={<Sun size={16} />}
          onClick={() => toggleColorScheme()}
          color={colorScheme === 'light' ? 'blue' : undefined}
        >
          <Group justify="space-between">
            <Text>{t('theme.light')}</Text>
            {colorScheme === 'light' && <Text size="xs">✓</Text>}
          </Group>
        </Menu.Item>
        <Menu.Item
          leftSection={<Moon size={16} />}
          onClick={() => toggleColorScheme()}
          color={colorScheme === 'dark' ? 'blue' : undefined}
        >
          <Group justify="space-between">
            <Text>{t('theme.dark')}</Text>
            {colorScheme === 'dark' && <Text size="xs">✓</Text>}
          </Group>
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}

/**
 * Get the icon for a color scheme
 */
export function getColorSchemeIcon(colorScheme: 'light' | 'dark') {
  switch (colorScheme) {
    case 'light':
      return <Sun size={18} />
    case 'dark':
      return <Moon size={18} />
  }
}
