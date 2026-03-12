import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '../types';
import { COLORS, SIZES, SHADOWS } from '../constants';

interface Props {
  category: Category;
  onPress: (category: Category) => void;
  compact?: boolean;
}

function CategoryCard({ category, onPress, compact = false }: Props) {
  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactCard}
        onPress={() => onPress(category)}
        activeOpacity={0.7}
      >
        <View style={styles.compactImageWrapper}>
          {category.image ? (
            <Image
              source={{ uri: category.image }}
              style={styles.compactImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.compactPlaceholder}>
              <Ionicons name="leaf-outline" size={24} color={COLORS.primary} />
            </View>
          )}
        </View>
        <Text style={styles.compactName} numberOfLines={2}>
          {category.name}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.card, SHADOWS.sm]}
      onPress={() => onPress(category)}
      activeOpacity={0.7}
    >
      <View style={styles.imageWrapper}>
        {category.image ? (
          <Image source={{ uri: category.image }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="leaf-outline" size={32} color={COLORS.primary} />
          </View>
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {category.name}
        </Text>
        {category._count?.products !== undefined && (
          <Text style={styles.count}>
            {category._count.products} product{category._count.products !== 1 ? 's' : ''}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={16} color={COLORS.textTertiary} />
    </TouchableOpacity>
  );
}

export default memo(CategoryCard);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
    marginHorizontal: SIZES.md,
  },
  imageWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    marginRight: SIZES.md,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: SIZES.fontLg,
    fontWeight: '600',
    color: COLORS.text,
  },
  count: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  // Compact (grid) variant for home screen
  compactCard: {
    alignItems: 'center',
    width: (SIZES.width - 64) / 4,
    marginBottom: SIZES.md,
  },
  compactImageWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    marginBottom: 6,
  },
  compactImage: {
    width: '100%',
    height: '100%',
  },
  compactPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
  },
  compactName: {
    fontSize: SIZES.fontXs,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 14,
  },
});
