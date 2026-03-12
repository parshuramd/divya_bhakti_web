import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useAppSelector } from '../store';
import { COLORS } from '../constants';

export function useTheme() {
  const systemScheme = useColorScheme();
  const themeMode = useAppSelector((state) => state.theme.mode);

  const isDark = useMemo(() => {
    if (themeMode === 'system') return systemScheme === 'dark';
    return themeMode === 'dark';
  }, [themeMode, systemScheme]);

  const colors = useMemo(
    () => ({
      primary: COLORS.primary,
      primaryLight: COLORS.primaryLight,
      primaryDark: COLORS.primaryDark,
      secondary: COLORS.secondary,
      secondaryLight: COLORS.secondaryLight,
      background: isDark ? COLORS.dark.background : COLORS.background,
      surface: isDark ? COLORS.dark.surface : COLORS.surface,
      card: isDark ? COLORS.dark.card : COLORS.card,
      text: isDark ? COLORS.dark.text : COLORS.text,
      textSecondary: isDark ? COLORS.dark.textSecondary : COLORS.textSecondary,
      textTertiary: isDark ? COLORS.dark.textTertiary : COLORS.textTertiary,
      textInverse: COLORS.textInverse,
      border: isDark ? COLORS.dark.border : COLORS.border,
      borderLight: isDark ? COLORS.dark.borderLight : COLORS.borderLight,
      divider: isDark ? COLORS.dark.divider : COLORS.divider,
      success: COLORS.success,
      error: COLORS.error,
      warning: COLORS.warning,
      info: COLORS.info,
      rating: COLORS.rating,
      skeleton: COLORS.skeleton,
      overlay: COLORS.overlay,
      shadow: COLORS.shadow,
    }),
    [isDark]
  );

  return { colors, isDark };
}
