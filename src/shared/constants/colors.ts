// iOS look: Apple system colours on grouped-gray backgrounds.
// `main` shades are the darker "accessible" variants so text stays readable;
// use useTheme().sys for iOS fill colours (icons, bars, chart marks).
export const Colors = {
  // Brand orange ramp (buttons, links, active tab, FAB).
  primary: {
    50: '#FFF1EB',
    100: '#FFE0D2',
    200: '#FFC1A5',
    300: '#FFA278',
    400: '#FF844B',
    500: '#FF6A2B',
    600: '#F0561A',
    700: '#C94312',
    800: '#9A320D',
    900: '#6B2209',
    main: '#FF6A2B',
    light: '#FF7A40',
    dark: '#C94312',
  },
  // Orange accent, purple highlight, navy for the balance card.
  brand: { orange: '#FF6A2B', purple: '#7B3FF2', navy: '#2B2B3F' },
  success: {
    main: '#248A3D',
    light: '#30D158',
    dark: '#1B5E2A',
    background: '#E3F7E8',
  },
  warning: {
    main: '#C93400',
    light: '#FF9F0A',
    dark: '#7A2E00',
    background: '#FFF1DC',
  },
  error: {
    main: '#D70015',
    light: '#FF453A',
    dark: '#8A0010',
    background: '#FFE5E3',
  },
  info: {
    main: '#0040DD',
    light: '#64D2FF',
    dark: '#002A8F',
    background: '#E5F1FF',
  },
  // iOS gray ramp. Only for things that look the same in both modes;
  // anything sitting on the page background should use useTheme().colors instead.
  grey: {
    50: '#F9F9FB',
    100: '#F2F2F7',
    200: '#E5E5EA',
    300: '#D1D1D6',
    400: '#C7C7CC',
    500: '#AEAEB2',
    600: '#8E8E93',
    700: '#636366',
    800: '#3A3A3C',
    900: '#1C1C1E',
  },
  light: {
    background: '#FFFFFF', // white page, soft-gray cards on top
    surface: '#F6F6F9',
    card: '#F6F6F9',
    surfaceAlt: '#EEEEF3', // fills: segmented track, search field, chips
    track: '#E5E5EA', // progress tracks, skeletons
    text: '#000000',
    textSecondary: '#6C6C70',
    textTertiary: '#8A8A8E',
    border: '#ECECF1', // thin card outlines
    divider: '#C6C6C8', // hairline list separator
    pressed: '#EAEAEF', // row highlight while pressed
    shadow: 'rgba(0,0,0,0.04)',
    overlay: 'rgba(0,0,0,0.4)',
    hero: '#F6F6F9',
    onHero: '#000000',
    onHeroMuted: '#6C6C70',
  },
  dark: {
    background: '#111117',
    surface: '#1E1E28',
    card: '#1E1E28',
    surfaceAlt: '#2C2C2E',
    track: '#3A3A3C',
    text: '#FFFFFF',
    textSecondary: '#AEAEB2',
    textTertiary: '#8E8E93',
    border: '#38383A',
    divider: '#38383A',
    pressed: '#2C2C2E',
    shadow: 'rgba(0,0,0,0.3)',
    overlay: 'rgba(0,0,0,0.6)',
    hero: '#1C1C1E',
    onHero: '#FFFFFF',
    onHeroMuted: '#AEAEB2',
  },
  // Apple system colours, light and dark variants.
  sysLight: {
    blue: '#007AFF', green: '#34C759', red: '#FF3B30', orange: '#FF9500', yellow: '#FFCC00',
    teal: '#30B0C7', indigo: '#5856D6', purple: '#AF52DE', pink: '#FF2D55', gray: '#8E8E93',
  },
  sysDark: {
    blue: '#0A84FF', green: '#30D158', red: '#FF453A', orange: '#FF9F0A', yellow: '#FFD60A',
    teal: '#40C8E0', indigo: '#5E5CE6', purple: '#BF5AF2', pink: '#FF375F', gray: '#8E8E93',
  },
  categoryColors: [
    '#FF3B30', '#FF9500', '#FFCC00', '#34C759',
    '#00C7BE', '#30B0C7', '#32ADE6', '#007AFF',
    '#5856D6', '#AF52DE', '#FF2D55', '#A2845E',
    '#FF6961', '#5AC8FA', '#5E5CE6', '#BF5AF2',
  ],
  income: '#248A3D',
  expense: '#D70015',
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export type ColorKey = keyof typeof Colors;
export type ThemeColors = typeof Colors.light;
