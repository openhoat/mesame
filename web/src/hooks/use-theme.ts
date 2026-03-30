import { useMantineColorScheme } from '@mantine/core'

export type ColorSchemeValue = 'light' | 'dark' | 'auto'

/**
 * Hook to manage theme with Mantine's color scheme support
 */
export function useTheme() {
  const { colorScheme, setColorScheme, toggleColorScheme } = useMantineColorScheme()

  return {
    /** Current color scheme preference: 'light', 'dark', or 'auto' */
    colorScheme,
    /** Set color scheme: 'light', 'dark', or 'auto' */
    setColorScheme: setColorScheme as (value: ColorSchemeValue) => void,
    /** Toggle between light and dark */
    toggleColorScheme,
  }
}
