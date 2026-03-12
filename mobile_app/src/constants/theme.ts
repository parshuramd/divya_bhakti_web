import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  primary: '#FF7A00',
  primaryLight: '#FFA042',
  primaryDark: '#E06600',
  secondary: '#FFD700',
  secondaryLight: '#FFE44D',

  background: '#FFFFFF',
  surface: '#F8F8F8',
  card: '#FFFFFF',

  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textInverse: '#FFFFFF',

  border: '#E5E5E5',
  borderLight: '#F0F0F0',
  divider: '#EEEEEE',

  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  rating: '#FFB800',

  skeleton: '#E1E1E1',
  skeletonHighlight: '#F2F2F2',

  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.08)',

  // Dark mode
  dark: {
    background: '#121212',
    surface: '#1E1E1E',
    card: '#252525',
    text: '#F5F5F5',
    textSecondary: '#AAAAAA',
    textTertiary: '#777777',
    border: '#333333',
    borderLight: '#2A2A2A',
    divider: '#2A2A2A',
  },
} as const;

export const FONTS = {
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  medium: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  bold: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
} as const;

export const SIZES = {
  // Global
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,

  // Font sizes
  fontXs: 10,
  fontSm: 12,
  fontMd: 14,
  fontLg: 16,
  fontXl: 18,
  fontXxl: 20,
  fontTitle: 24,
  fontHero: 32,

  // Border radius
  radiusSm: 6,
  radiusMd: 10,
  radiusLg: 16,
  radiusXl: 24,
  radiusFull: 9999,

  // Screen dimensions
  width,
  height,

  // Common
  headerHeight: Platform.OS === 'ios' ? 88 : 64,
  tabBarHeight: Platform.OS === 'ios' ? 84 : 64,
  bottomInset: Platform.OS === 'ios' ? 34 : 0,
} as const;

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;
