import { ActionIcon, Group, Menu, Text } from '@mantine/core'
import { Computer, Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { type ColorSchemeValue, useTheme } from '@/hooks/use-theme'

interface ThemeToggleProps {
  /** Toggle variant: simple icon or dropdown menu */
  variant?: 'icon' | 'menu'
}

/**
 * Theme toggle component with system preference support
 */
export function ThemeToggle({ variant = 'icon' }: ThemeToggleProps) {
  const { t } = useTranslation()
  const { colorScheme, setColorScheme, toggleColorScheme } = useTheme()

  // Determine the icon based on current color scheme
  // When 'auto', show sun during day (light system) or moon during night (dark system)
  const isDark = colorScheme === 'dark'
  const icon = isDark ? <Moon size={18} /> : <Sun size={18} />

  if (variant === 'icon') {
    return (
      <ActionIcon
        onClick={toggleColorScheme}
        variant="subtle"
        title={t('theme.toggle')}
        aria-label={t('theme.toggle')}
        size="lg"
      >
        {icon}
      </ActionIcon>
    )
  }

  const handleSelect = (value: ColorSchemeValue) => {
    setColorScheme(value)
  }

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <ActionIcon
          variant="subtle"
          title={t('theme.selectTheme')}
          aria-label={t('theme.selectTheme')}
          size="lg"
        >
          {icon}
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>{t('theme.selectTheme')}</Menu.Label>
        <Menu.Item
          leftSection={<Sun size={16} />}
          onClick={() => handleSelect('light')}
          color={colorScheme === 'light' ? 'blue' : undefined}
        >
          <Group justify="space-between">
            <Text>{t('theme.light')}</Text>
            {colorScheme === 'light' && <Text size="xs">✓</Text>}
          </Group>
        </Menu.Item>
        <Menu.Item
          leftSection={<Moon size={16} />}
          onClick={() => handleSelect('dark')}
          color={colorScheme === 'dark' ? 'blue' : undefined}
        >
          <Group justify="space-between">
            <Text>{t('theme.dark')}</Text>
            {colorScheme === 'dark' && <Text size="xs">✓</Text>}
          </Group>
        </Menu.Item>
        <Menu.Item
          leftSection={<Computer size={16} />}
          onClick={() => handleSelect('auto')}
          color={colorScheme === 'auto' ? 'blue' : undefined}
        >
          <Group justify="space-between">
            <Text>{t('theme.system')}</Text>
            {colorScheme === 'auto' && <Text size="xs">✓</Text>}
          </Group>
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}
