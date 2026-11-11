import { useColorScheme } from 'react-native';
import { useUIStore } from '@/stores/uiStore';
import { LightTheme, DarkTheme } from '@/shared/constants/theme';
import { Colors } from '@/shared/constants/colors';

export function useTheme() {
  const systemColorScheme = useColorScheme();
  const themeMode = useUIStore((s) => s.theme);

  const isDark =
    themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark');

  const theme = isDark ? DarkTheme : LightTheme;
  const colors = isDark ? Colors.dark : Colors.light;
  // Accent that stays readable on the page background in both modes.
  const accent = isDark ? Colors.primary.light : Colors.primary.main;

  return { theme, colors, accent, isDark };
}
