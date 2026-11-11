// "Fresh teal": warm stone neutrals + one teal accent. Flat, no gradients.
export const Colors = {
  primary: {
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#14B8A6',
    600: '#0D9488',
    700: '#0F766E',
    800: '#115E59',
    900: '#134E4A',
    main: '#0F766E',
    light: '#2DD4BF',
    dark: '#134E4A',
  },
  success: {
    main: '#15803D',
    light: '#4ADE80',
    dark: '#14532D',
    background: '#DCFCE7',
  },
  warning: {
    main: '#B45309',
    light: '#FBBF24',
    dark: '#78350F',
    background: '#FEF3C7',
  },
  error: {
    main: '#B91C1C',
    light: '#F87171',
    dark: '#7F1D1D',
    background: '#FEE2E2',
  },
  info: {
    main: '#0369A1',
    light: '#38BDF8',
    dark: '#0C4A6E',
    background: '#E0F2FE',
  },
  // Stone ramp. Only for things that look the same in both modes;
  // anything sitting on the page background should use useTheme().colors instead.
  grey: {
    50: '#FAFAF9',
    100: '#F5F5F4',
    200: '#E7E5E4',
    300: '#D6D3D1',
    400: '#A8A29E',
    500: '#78716C',
    600: '#57534E',
    700: '#44403C',
    800: '#292524',
    900: '#1C1917',
  },
  light: {
    background: '#F6F5F1',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    surfaceAlt: '#EFEDE8', // chips, icon buttons, inputs on cards
    track: '#E7E5E4', // progress bar tracks, skeletons
    text: '#1C1917',
    textSecondary: '#57534E',
    textTertiary: '#78716C',
    border: '#E7E5E4',
    divider: '#F0EEEA',
    shadow: 'rgba(28,25,23,0.06)',
    overlay: 'rgba(28,25,23,0.5)',
    hero: '#0F766E', // balance card
    onHero: '#FFFFFF',
    onHeroMuted: '#CCFBF1',
  },
  dark: {
    background: '#151413',
    surface: '#1F1D1B',
    card: '#1F1D1B',
    surfaceAlt: '#2A2724',
    track: '#33302C',
    text: '#F5F5F4',
    textSecondary: '#D6D3D1',
    textTertiary: '#A8A29E',
    border: '#33302C',
    divider: '#262421',
    shadow: 'rgba(0,0,0,0.3)',
    overlay: 'rgba(0,0,0,0.7)',
    hero: '#134E4A',
    onHero: '#F0FDFA',
    onHeroMuted: '#99F6E4',
  },
  categoryColors: [
    '#DC2626', '#EA580C', '#CA8A04', '#16A34A',
    '#059669', '#0D9488', '#0891B2', '#2563EB',
    '#4F46E5', '#7C3AED', '#9333EA', '#DB2777',
    '#E11D48', '#65A30D', '#D97706', '#0284C7',
  ],
  income: '#15803D',
  expense: '#B91C1C',
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export type ColorKey = keyof typeof Colors;
export type ThemeColors = typeof Colors.light;
