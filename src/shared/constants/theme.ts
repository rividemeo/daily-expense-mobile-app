import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { Colors } from './colors';

// iOS text styles (largeTitle, title2, headline, body, subhead, footnote, caption1).
export const Space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const Radius = { sm: 8, md: 10, lg: 12, xl: 20, pill: 999 } as const;
export const Type = {
  caption: { fontSize: 12, lineHeight: 16 }, // caption1
  footnote: { fontSize: 13, lineHeight: 18 },
  body: { fontSize: 15, lineHeight: 20 }, // subhead
  bodyLg: { fontSize: 17, lineHeight: 22 }, // body
  title: { fontSize: 17, lineHeight: 22, fontWeight: '600' as const }, // headline
  title3: { fontSize: 20, lineHeight: 25, fontWeight: '600' as const },
  headline: { fontSize: 22, lineHeight: 28, fontWeight: '700' as const }, // title2
  display: { fontSize: 34, lineHeight: 41, fontWeight: '700' as const, letterSpacing: 0.37 }, // largeTitle
} as const;
export const TOUCH = 44; // minimum tap target

export const LightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.primary.main,
    primaryContainer: Colors.primary[100],
    secondary: Colors.primary[600],
    secondaryContainer: Colors.primary[50],
    background: Colors.light.background,
    surface: Colors.light.surface,
    surfaceVariant: Colors.light.surfaceAlt,
    error: Colors.error.main,
    errorContainer: Colors.error.background,
    onPrimary: Colors.white,
    onPrimaryContainer: Colors.primary[900],
    onBackground: Colors.light.text,
    onSurface: Colors.light.text,
    onSurfaceVariant: Colors.light.textSecondary,
    outline: Colors.light.border,
    outlineVariant: Colors.light.divider,
    elevation: {
      level0: 'transparent',
      level1: Colors.light.surface,
      level2: Colors.light.surface,
      level3: Colors.light.surfaceAlt,
      level4: Colors.light.surfaceAlt,
      level5: Colors.light.surfaceAlt,
    },
  },
  roundness: Radius.md,
};

export const DarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: Colors.primary.light,
    primaryContainer: Colors.primary[800],
    secondary: Colors.primary[300],
    secondaryContainer: Colors.primary[900],
    background: Colors.dark.background,
    surface: Colors.dark.surface,
    surfaceVariant: Colors.dark.surfaceAlt,
    error: Colors.error.light,
    errorContainer: Colors.error.dark,
    onPrimary: Colors.white,
    onPrimaryContainer: Colors.primary[100],
    onBackground: Colors.dark.text,
    onSurface: Colors.dark.text,
    onSurfaceVariant: Colors.dark.textSecondary,
    outline: Colors.dark.border,
    outlineVariant: Colors.dark.divider,
    elevation: {
      level0: 'transparent',
      level1: Colors.dark.surface,
      level2: Colors.dark.surface,
      level3: Colors.dark.surfaceAlt,
      level4: Colors.dark.surfaceAlt,
      level5: Colors.dark.surfaceAlt,
    },
  },
  roundness: Radius.md,
};
