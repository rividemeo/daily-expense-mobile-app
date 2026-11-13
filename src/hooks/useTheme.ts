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
  // iOS system colours for fills, icons and chart marks.
  const sys = isDark ? Colors.sysDark : Colors.sysLight;
  // Tint for links and buttons (systemBlue).
  const accent = sys.blue;

  return { theme, colors, sys, accent, isDark };
}
