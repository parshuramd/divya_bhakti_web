import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileScreenProps } from '../../navigation/types';
import { useAppDispatch, useAppSelector, logout } from '../../store';
import { COLORS, SIZES, SHADOWS, CONFIG } from '../../constants';
import { getInitials } from '../../utils/format';

type MenuItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  screen?: string;
  action?: () => void;
  color?: string;
};

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const wishlistCount = useAppSelector((state) => state.wishlist.items.length);

  const handleLogout = useCallback(() => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => dispatch(logout()),
      },
    ]);
  }, [dispatch]);

  const menuItems: MenuItem[][] = [
    [
      { icon: 'person-outline', label: 'Edit Profile', screen: 'EditProfile' },
      { icon: 'location-outline', label: 'My Addresses', screen: 'Addresses' },
      { icon: 'heart-outline', label: `Wishlist (${wishlistCount})`, screen: 'Wishlist' },
    ],
    [
      { icon: 'receipt-outline', label: 'My Orders', action: () => navigation.getParent()?.navigate('Orders') },
    ],
    [
      { icon: 'settings-outline', label: 'Settings', screen: 'Settings' },
      { icon: 'help-circle-outline', label: 'Help & Support', action: () => {} },
    ],
    [
      { icon: 'log-out-outline', label: 'Sign Out', action: handleLogout, color: COLORS.error },
    ],
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={[styles.profileCard, SHADOWS.md]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name ? getInitials(user.name) : 'U'}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          {user?.phone && <Text style={styles.userPhone}>{user.phone}</Text>}
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('EditProfile')}
          style={styles.editButton}
        >
          <Ionicons name="create-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Menu Sections */}
      {menuItems.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.menuSection}>
          {section.map((item, itemIndex) => (
            <TouchableOpacity
              key={itemIndex}
              style={[
                styles.menuItem,
                itemIndex < section.length - 1 && styles.menuItemBorder,
              ]}
              onPress={() => {
                if (item.screen) navigation.navigate(item.screen as any);
                else item.action?.();
              }}
              activeOpacity={0.6}
            >
              <Ionicons name={item.icon} size={22} color={item.color || COLORS.text} />
              <Text style={[styles.menuLabel, item.color ? { color: item.color } : null]}>
                {item.label}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <Text style={styles.appVersion}>{CONFIG.APP_NAME} v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  content: {
    padding: SIZES.md,
    paddingBottom: SIZES.xxl,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: SIZES.fontTitle,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
    marginLeft: SIZES.md,
  },
  userName: {
    fontSize: SIZES.fontXl,
    fontWeight: '700',
    color: COLORS.text,
  },
  userEmail: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  userPhone: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  editButton: {
    padding: SIZES.sm,
  },
  menuSection: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    marginBottom: SIZES.md,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.md,
    paddingVertical: 14,
    gap: 12,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  menuLabel: {
    flex: 1,
    fontSize: SIZES.fontLg,
    color: COLORS.text,
    fontWeight: '500',
  },
  appVersion: {
    textAlign: 'center',
    fontSize: SIZES.fontSm,
    color: COLORS.textTertiary,
    marginTop: SIZES.md,
  },
});
