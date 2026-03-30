import { useMantineColorScheme } from '@mantine/core'

export type ColorSchemePreference = 'light' | 'dark' | 'system'

/**
 * Hook to manage theme with Mantine's color scheme support
 */
export function useTheme() {
  const { colorScheme, setColorScheme, toggleColorScheme } = useMantineColorScheme()

  return {
    /** Current resolved color scheme (light or dark) */
    colorScheme,
    /** Set color scheme */
    setColorScheme,
    /** Toggle between light and dark */
    toggleColorScheme,
  }
}
