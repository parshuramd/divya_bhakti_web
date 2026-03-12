import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector, setThemeMode } from '../../store';
import { COLORS, SIZES, CONFIG } from '../../constants';

type ThemeMode = 'light' | 'dark' | 'system';

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'light', label: 'Light', icon: 'sunny-outline' },
  { value: 'dark', label: 'Dark', icon: 'moon-outline' },
  { value: 'system', label: 'System', icon: 'phone-portrait-outline' },
];

export default function SettingsScreen() {
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector((state) => state.theme.mode);

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.themeRow}>
          {THEME_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[styles.themeOption, themeMode === option.value && styles.themeOptionActive]}
              onPress={() => dispatch(setThemeMode(option.value))}
            >
              <Ionicons
                name={option.icon}
                size={24}
                color={themeMode === option.value ? COLORS.primary : COLORS.textSecondary}
              />
              <Text
                style={[
                  styles.themeLabel,
                  themeMode === option.value && styles.themeLabelActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Text style={styles.settingDesc}>Order updates & offers</Text>
          </View>
          <Switch
            trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
            thumbColor="#fff"
            value={true}
            onValueChange={() => {}}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <SettingInfo label="App Name" value={CONFIG.APP_NAME} />
        <SettingInfo label="Version" value="1.0.0" />
        <SettingInfo label="Support" value={CONFIG.SUPPORT_EMAIL} />
      </View>
    </View>
  );
}

function SettingInfo({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface, padding: SIZES.md },
  section: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.md,
  },
  sectionTitle: {
    fontSize: SIZES.fontXl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  themeRow: { flexDirection: 'row', gap: SIZES.sm },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  themeOptionActive: { borderColor: COLORS.primary, backgroundColor: '#FFF8F0' },
  themeLabel: { fontSize: SIZES.fontSm, color: COLORS.textSecondary },
  themeLabelActive: { color: COLORS.primary, fontWeight: '600' },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.sm,
  },
  settingLabel: { fontSize: SIZES.fontLg, fontWeight: '500', color: COLORS.text },
  settingDesc: { fontSize: SIZES.fontSm, color: COLORS.textSecondary, marginTop: 2 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  infoLabel: { fontSize: SIZES.fontMd, color: COLORS.textSecondary },
  infoValue: { fontSize: SIZES.fontMd, fontWeight: '500', color: COLORS.text },
});
